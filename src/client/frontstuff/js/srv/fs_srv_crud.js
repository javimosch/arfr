/*global angular*/
/*global $U*/
(function() {
    var app = angular.module('fs_srv_crud', []);
    app.service('crud', function($rootScope, server) {
        var r = $rootScope,
            db = server;

        function notify(m, t) {
            r.notify(m, {
                type: t,
                duration: 5000,
                clickDismissable: true
            });
        }

        function handleError(err) {
            notify('error, try later.', 'warning');
        }

        function fireEvent(evts,p,path){
            if(evts){
                evts.forEach(evt=>{
                    evt(p);
                });
                console.log('crud-fire '+path+' triggers ',evts.length,'events');
            }
        }

        function createActions(s, opt, params) {
            function fire(path,p){
                var evts = $U.val(opt,path);
                fireEvent(evts,p,path);
            }

            s.deleteSilent = function() {
                db.ctrl(opt.name, 'remove', {
                    _id: s.item._id
                }).then(function(data) {
                    if (data.ok) {
                        s.back();
                    } else {
                        handleError(data);
                    }
                }).error(handleError);
            };
            s.delete = function() {
                if (opt.modals && opt.modals.confirm) {
                    s[opt.modals.confirm]({
                        message:$U.val(opt, 'modals.delete.description') || 'Delete item?',
                        data: $U.val(opt, 'modals.delete.data') || {}
                    }, function() {
                        s.deleteSilent();
                    });
                } else {
                    if (window.confirm($U.val(opt, 'modals.delete.description') || 'Delete item?')) {
                        s.deleteSilent();
                    }
                }
            };
            s.validate = () => {
                $U.ifThenMessage($U.val(opt, 'validate.options',{args:[opt.scope]}) || [], (m) => {
                    if (typeof m[0] !== 'string') {
                        notify(m[0](), 'warning');
                    } else {
                        notify(m[0], 'warning');
                    }
                }, s.save);
            };
            s.save = function() {
                db.ctrl(opt.name, 'save', s.item).then(function(data) {
                    if (data.ok) {
                        fire('events.after.save');
                        if($U.has($U.val(opt,'save.after.goBack'),[undefined,true])){
                            s.back();    
                        }
                    } else {
                        handleError(data);
                    }
                }).error(handleError);
            };
            s.back = () => {
                if (r.params && r.params.prevRoute) {
                    return r.route(r.params.prevRoute);
                } else {
                    r.route($U.val(opt, 'routes.back') || 'dashboard');
                }
            };
            s.cancel = function() {
                s.back();
            };
            s.load = function(id) {
                if (r.params && r.params.item && r.params.item._diag) {
                    s.item = r.params.item; //partial loading
                    delete r.params.item;
                }
                db.ctrl(opt.name, 'get', Object.assign({
                    _id: id || params.id || s.item._id,
                },$U.val(opt,'defaults.http.request')||{})).then(function(data) {
                    s.requesting = false;
                    if (data.ok && data.result !== null) {
                        s.item = data.result;
                    } else {
                        handleError(data);
                    }
                }).error(handleError);
            }
            s.init = () => {
                if (params && params.id && params.id.toString() !== '-1') {
                    s.load();
                } else {
                    s.reset();
                }
                r.setCurrentCtrl(s);
            };
            s.reset = () => {
                s.item=$U.val(opt,'defaults.data')||{};
            };
        }
        return {
            create: function(opt) {
                if (!opt.name) return notify('crud.create require opt.name', 'warning');
                if (!opt.scope) return notify('crud.create require opt.scope', 'warning');
                if (!opt.routeParams) return notify('crud.create require opt.routeParams', 'warning');
                createActions(opt.scope, opt, opt.routeParams);
                return opt.scope;
            }
        };
    });
})();