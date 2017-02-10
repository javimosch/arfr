angular.module('app_api_paginator', []).service('appApiPaginator', ['appApi', 'appUtils', function(appApi, appUtils) {
    function omitKeys(o, keys) {
        var obj = {};
        for (var x in o) {
            if (!_.includes(keys, x)) obj[x] = o[x];
        }
        return obj;
    }

    function handler(modelName) {
        var self = this;
        self.id = Date.now();
        self.working = false;
        self.ctrl = function(data, model, opt) {
            var promise = appUtils.Promise((resolve, err, emit) => {
                if (!model.pagination) {
                    err('model.pagination required.');
                    console.warn('$mongoosePaginate model.pagination required.');
                    return;
                }
                if (self.working) return; // console.warn('$mongoosePaginate is working, wait.',self.id);
                // console.log('$mongoosePaginate:start',self.id);
                self.working = true;
                self.workingTS = Date.now();

                //Cut the call restriction after 10 sec (even if the async operation is not finished).
                ((ts) => {
                    setTimeout(() => {
                        if (self.workingTS == ts && self.working == true) {
                            self.working = false;
                        }
                    }, 10000)
                })(self.workingTS);

                var action = opt && opt.action || 'paginate';
                appApi.ctrl(modelName, action, Object.assign({
                    __limit: model.pagination.itemsPerPage,
                    __lean: true,
                    __page: model.pagination.currentPage
                }, data)).then(r => {
                    self.working = false;
                    // console.log('$mongoosePaginate:end',self.id,'items',r.result.docs.length);
                    if (!r.ok) {
                        self.working = false;
                        return;
                    }
                    var numberOfPages = r.result.pages;
                    //                    console.info(model.pagination.currentPage,model.pagination,numberOfPages);

                    if (model.pagination) {
                        model.pagination.update({
                            itemsLength: r.result.docs.length,
                            numPages: numberOfPages,
                            total: r.result.total
                        });
                    }
                    r.result = r.result.docs;
                    if (opt && opt.autoResolve) {
                        autoResolve(r);
                        resolve(r);
                    }
                    else {
                        resolve(r);
                    }
                });

            });
            //
            function autoResolve(res) {
                if (opt.callback) {
                    opt.callback(res.result);
                }
                else {
                    model.update(res.result, null);
                }
            }
            return promise;
        }
    }
    var handlers = {};
    return {
        createFor: function(modelName) {
            // if (!handlers[modelName]) {
            // console.info('$mongoosePaginate creating handler for ' + modelName);
            //handlers[modelName] =
            return new handler(modelName);
            //}
            //console.info('$mongoosePaginate delivering handler for ' + modelName);
            // return handlers[modelName];
        }
    };
}]);
