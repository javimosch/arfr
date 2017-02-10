/*global angular*/
/*global expose*/
/*global _*/
/*global MyPromise*/
/*global newId*/
/*global $*/
/*global $U*/
/*global $G*/
/*global diagsGetAvailableRanges*/
var srv = angular.module('app.services', []);

srv.service('tpl', function($rootScope, $compile, $templateCache) {
    this.compile = (n, s) => {
        var raw = $templateCache.get(n + '.html');
        return this.compileRaw(raw, s);
    };
    this.compileRaw = (raw, s) => {
        var el = $compile(angular.element(raw))(s);
        return el;
    }
    expose('tpl', this);
});

srv.service('$mongoosePaginate', ['server', function(db) {
    function omitKeys(o, keys) {
        var obj = {};
        for (var x in o) {
            if (!_.includes(keys, x)) obj[x] = o[x];
        }
        return obj;
    }

    function handler(modelName) {
        var self = this;
        self.working = false;
        self.ctrl = function(data, model) {
            return MyPromise((resolve, err, emit) => {
                if (!model.pagination) {
                    err('model.pagination required.');
                    console.warn('$mongoosePaginate model.pagination required.');
                    return;
                }
                if (self.working) return console.warn('$mongoosePaginate is working, wait.');
                self.working = true;
                db.ctrl(modelName, 'paginate', Object.assign({
                    __limit: model.pagination.itemsPerPage,
                    __lean: true,
                    __page: model.pagination.currentPage
                }, data)).then(r => {
                    if (!r.ok) {
                        self.working = false;
                        return;
                    }
                    var numberOfPages = r.result.pages;
                    //                    console.info(model.pagination.currentPage,model.pagination,numberOfPages);
                    self.working = false;
                    if (model.pagination) {
                        model.pagination.update({
                            itemsLength: r.result.docs.length,
                            numPages: numberOfPages,
                            total: r.result.total
                        });
                    }
                    r.result = r.result.docs;
                    resolve(r);
                });
            });
        }
    }
    var handlers = {};
    return {
        get: function(modelName) {
            if (!handlers[modelName]) {
                // console.info('$mongoosePaginate creating handler for ' + modelName);
                handlers[modelName] = new handler(modelName);
            }
            //console.info('$mongoosePaginate delivering handler for ' + modelName);
            return handlers[modelName];
        }
    };
}]);

srv.service('localdb', ['$http', function(http) {

    return function(settings) {
        return MyPromise(function(resolve) {
            //handlers
            resolve({
                localdb: true
            });
        });
    };
}]);
srv.directive('fileModel', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function() {
                scope.$apply(function() {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);
srv.service('fileUpload', ['$http', function($http) {
    this.single = function(opt, success, err) {
        var fd = new FormData();
        Object.keys(opt.data).forEach((key) => {
            fd.append(key, opt.data[key]);
        });
        fd.append('file', opt.file);
        $http.post(opt.url, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            })
            .success(success)
            .error(err);
    };
}]);
srv.service('server', ['$http', 'localdb', '$rootScope', 'fileUpload', function(http, localdb, r, fileUpload) {
    //var URL = 'http://ujkk558c0c9a.javoche.koding.io:3434';
    var URL = 'http://localhost:5000';

    r.db = {
        url: {
            set: function(url) {
                URL = url;
            }
        }
    };

    if ($G && $G.serverURL) {
        URL = $G.serverURL; //updates serverURL from express (node env serverURL);
        $U.emitPreserve('server-up');
    }

    /*
        $.ajax({
            url: '/data.json',
            async: false,
            dataType: 'json',
            success: function(r) {
                URL = r.config.backendURL; //updates serverURL from express (node env serverURL);
                $U.emitPreserve('server-up');
                console.info('server-up',URL);
            }
        });

        $.ajax("/serverURL").then(function(r) {
            URL = r.URL; //updates serverURL from express (node env serverURL);
            $U.emitPreserve('server-up');
            console.info('server:url(env serverURL):' + URL);
        });
    */
    //var URL = 'http://blooming-plateau-64344.herokuapp.com/';
    var globalState = {}; //containts a global state of the service. (db)
    var localData = null;

    var spinner = (() => {
        return (v) => {
            r.showSpinner = v;
            r.dom();
        }
    })();
    var logger = (() => {
        var _controlledErrorsStrings = [];
        var _controlledErrors = {};
        var _errors = {};
        var _logs = {};
        var fn = new function() {
            var self = this;
            self.id = newId(20); //new Date() + '#' + Object.keys(_logs).length;
            return (url, req) => {
                var item = {
                    url: url,
                    req: req
                };
                _logs[self.id] = item;
                setTimeout(() => {
                    if (_logs[self.id] !== undefined) {
                        item.err = "Logger: request timeout.";
                        delete _logs[self.id];
                    }
                }, 1000 * 30);
                r.$emit('logger.working');
                var rta = function(res) {
                    //
                    if (_.isUndefined(_logs[self.id])) {
                        return; //registered as async or duplicate response (very rare).
                    }

                    //data for $http, result for others
                    //add more validations for detect a fail here.
                    if (!res.data && !res.result) {
                        item.err = 'Server down, try later.';
                        if (_.includes(_controlledErrorsStrings, item.err)) {
                            _controlledErrors[self.id] = item;
                        }
                        else {
                            _errors[self.id] = item;
                        }
                    }
                    else {
                        var data = res.data || res;
                        if (data.ok !== true) {
                            item.err = data.err || data;
                            item.message = data.message || null;
                            if (_.includes(_controlledErrorsStrings, item.err)) {
                                _controlledErrors[self.id] = item;
                            }
                            else {
                                if (item.err && item.err.type) {
                                    if (_.includes(_controlledErrorsStrings, item.err.type)) {
                                        item.message = item.err.message;
                                        _controlledErrors[self.id] = item;
                                    }
                                    else {
                                        _errors[self.id] = item;
                                    }
                                }
                                else {
                                    _errors[self.id] = item;
                                }
                            }
                        }
                    }
                    if (!_.isUndefined(_logs[self.id])) {
                        delete _logs[self.id];
                    }
                    if (Object.keys(_logs).length === 0) {
                        r.$emit('logger.clear');
                    }
                };
                rta.registerAsync = () => {
                    delete _logs[self.id];
                    r.$emit('logger.clear');
                };
                return rta;
            }
        };
        fn.addControlledErrors = (arr) => {
            _controlledErrorsStrings = _.union(arr, _controlledErrorsStrings);
        };
        fn.clearErrors = () => _errors = {};
        fn.hasErrors = () => Object.keys(_errors).length > 0;
        fn.hasPending = () => Object.keys(_logs).length > 0;
        fn.pending = () => {
            var msg = 'Pending<br>';
            _.each(_logs, (v, k) => {
                console.info(v.url);
                if (msg !== '') msg += '<br>';
                msg += v.url + ': ' + JSON.stringify(v.req);
            });
            return msg;
        }
        fn.errors = () => {
            var msg = 'Errors<br>';
            _.each(_errors, (v, k) => {
                console.info(v);
                if (msg !== '') msg += '<br>';
                try {
                    msg += v.url + ': ' + JSON.stringify(v.err);
                }
                catch (e) {
                    msg += v.url + ': ' + 'Unparseable error. See the console.';
                }
            });
            return msg;
        }
        r.state = {
            working: () => fn.hasPending(),
            data: _logs
        };
        r.logger = fn;
        return fn;
    })();
    r.$on('logger.working', () => {
        spinner(true);
        //console.info('LOGGER:WORKING');
    });
    r.$on('logger.clear', () => {
        spinner(false);
        //console.info('LOGGER:CLEAR');
    });

    function getLocalData() {
        console.log('get-local-data');
        return MyPromise(function(resolve, error) {
            if (localData) {
                resolve(localData);
            }
            else {
                $.getJSON('./data.json', function(data) {
                    localData = data;
                    resolve(localData);
                }).fail(function(jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                });
            }
        });
    }


    function handleServerError(err) {
        console.warn(err);
    }

    function handleError(_log, err) {
        _log(err);
        //console.warn(err);
    }

    function get(relativeUrl, data, callback) {
        //        console.warn('URL ' + URL + '/' + relativeUrl);
        var _log = logger(relativeUrl, data);
        http({
            method: 'GET',
            data: data,
            url: URL + '/' + relativeUrl
        }).then(function(res) {
            _log(res);
            if (callback) {
                callback(res);
            }
        }, (err) => handleError(_log, err));
    }
    r.get = get;

    function post(relativeUrl, data, callback, error) {
        data = data || {};
        var _log = logger(relativeUrl, data);

        if (globalState.async) {
            data = Object.assign(data, {
                ___serviceOptions: {
                    logAsAsync: true
                }
            });
            delete globalState.async;
        }

        if (data.___serviceOptions) {
            if (data.___serviceOptions.logAsAsync == true) {
                _log.registerAsync();
            }
        }

        $U.once('server-up', function() {
            var url = URL + '/' + relativeUrl;
            url = url.replaceAll('//', '/').replaceAll(":/", '://')
            http({
                method: 'POST',
                data: data,
                url: url
            }).then(function(res) {
                _log(res);
                if (res.data && res.data.ok == false) {
                    console.warn('SERVER:REQUEST:WARNING = ', res.data.err || "Unkown error detected", relativeUrl);
                }
                return callback(res);
            }, (err) => {
                handleError(_log, err);
                error(err);
            });
        });
    }



    function login(data) {
        console.log('SEVICE LOGIN', data);
        return MyPromise(function(resolve, error) {
            post('login', data, function(res) {
                resolve(res);
            }, error);
        });
    }

    function save(table, data) {
        return MyPromise(function(resolve, error) {
            post('save/' + table, data, function(res) {
                resolve(res);
            }, error);
        });
    }

    function getSingle(table, data) {
        return MyPromise(function(resolve, error) {
            post('get/' + table, data, function(res) {
                resolve(res);
            }, error);
        });
    }

    function getAll(table, data) {
        return MyPromise(function(resolve, error) {
            get('getAll/' + table, data, function(res) {
                resolve(res);
            }, error);
        });
    }

    function custom(controller, action, data, method) {
        if (method === 'get') {
            return MyPromise(function(resolve, error) {
                get(controller + '/' + action, data, function(res) {
                    resolve(res);
                }, error);
            });
        }
        else {
            return MyPromise(function(resolve, error) {
                post(controller + '/' + action, data, function(res) {
                    resolve(res);
                }, error);
            });
        }
    }


    function ctrl(ctrl, action, data) {
        return MyPromise(function(resolve, error) {

            post('ctrl/' + ctrl + '/' + action, data, function(res) {
                //console.info('CTRL: ',res.data);
                return resolve(res.data);
            }, error);

        });
    }



    var ws = {
        URL: () => URL,
        getAvailableRanges: (order) => diagsGetAvailableRanges(order, ctrl),
        login: login,
        save: save,
        get: getSingle,
        getAll: getAll,
        localData: getLocalData,
        custom: custom,
        http: function(ctrl, action, data) {
            return http.post(URL + '/' + 'ctrl/' + ctrl + '/' + action, data);
        },
        form: (relativeURL, data) => {
            if (!data.file) throw Error('form: file arg required');
            return MyPromise((r, err) => {
                var file = data.file;
                delete data.file;
                var _log = logger(relativeURL, data);
                fileUpload.single({
                    url: URL + '/' + relativeURL,
                    file: file,
                    data: data
                }, res => {
                    _log(res);
                    r(res);
                }, res => {
                    _log(res);
                    err(res);
                });
            });
        },
        setAsync: () => {
            globalState.async = true;
            return ws;
        },
        ctrl: ctrl,
        $get: (url, config) => {
            return MyPromise(function(resolve, error) {
                var _log = logger(url, data);
                http.get(url, config).then((res) => {
                    _log({
                        ok: true,
                        result: res
                    });
                    resolve(res);
                }, (err) => {
                    _log({
                        ok: false,
                        err: err
                    });
                    error(err);
                })
            });
        },
        $post: (url, data, config) => {
            return MyPromise(function(resolve, error) {
                var _log = logger(url, data);
                http.post(url, data, config).then((res) => {
                    _log({
                        ok: true,
                        result: res
                    });
                    resolve(res);
                }, (err) => {
                    _log({
                        ok: false,
                        err: err
                    });
                    error(err);
                })
            });
        },
        post: function(url, data) {
            return MyPromise(function(resolve, error) {
                post(url, data, function(res) {
                    resolve(res);
                }, error);
            });
        }
    };
    r.ws = ws;
    return ws;
}]);
