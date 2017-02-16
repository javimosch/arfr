/*global angular*/
/*global _*/
/*global moment*/
/*global $U*/
angular.module('service-app-api', ['service-app-utils']).service('appApi', ['$rootScope', '$log', 'appUtils', 'appSettings', 'fileUpload', 'i18n', function($rootScope, $log, appUtils, appSettings, fileUpload, i18n) {


    const CONSTANT = {
        COMMON_DATABASE_ACTIONS: ['get', 'getAll', 'save', 'update', 'getById', 'exists', 'removeWhen', 'updateOrPushArrayElement', 'modelCustom', 'aggregate'],
        COMMON_DATABASE_CONTROLLERS: ['categories', 'texts']
    };

    function getLemonwayMessage(res) {
        return res.err.Msg + '  (LEMONWAY CODE ' + res.err.Code + ')';
    }

    function getGenericMessage(res) {
        if (res.err && res.err.code) {
            if (i18n && i18n[res.err.code]) {
                return i18n[res.err.code];
            }
        }
        var str = (res.err && (res.err.message || res.err.msg) || JSON.stringify(res));
        str = str.replace("'", "");
        return str + '  (BACKEND)';
    }

    function json(ctrl, action, data) {
        return appUtils.Promise(function(resolve, error) {
            appUtils.httpPost(appSettings.URL + 'api/' + ctrl + '/' + action, data, function(res) {
                //console.info('CTRL: ',res.data);
                return resolve(res.data);
            }, error);
        });
    }

    function fetch(url) {
        return appUtils.Promise(function(resolve, error) {
            appUtils.httpGet(url, function(res) {
                return resolve(res.data);
            }, error);
        });
    }

    function form(ctrl, action, payload) {
        var multerType = payload.__form;
        delete payload.__form;
        return appUtils.Promise(function(resolve, error) {
            var file = payload.file;
            delete payload.file;
            payload = JSON.stringify(payload);
            return fileUpload.single({
                url: appSettings.URL + 'api/' + ctrl + '/' + action + '/' + multerType,
                file: file,
                data: payload
            }, (res) => {
                resolve(res);
            }, (res) => {
                error(res);
            });
        });
    }

    function handle(controller, action, payload) {
        return appUtils.Promise(function(resolve, err, emit) {
            if (payload.__form) {
                form(controller, action, payload).then(onSuccess).error(onError);
            }
            else {
                json(controller, action, payload).then(onSuccess).error(onError);
            }

            function onSuccess(res) {
                if (res.ok != undefined && res.ok == false) {
                    if (res.err && res.err.Code) {
                        return emit('validate', getLemonwayMessage(res));
                    }
                    if (res.err) {
                        return emit('validate', getGenericMessage(res));
                    }
                    err(res);
                }
                else {
                    resolve(res.result);
                }
            }

            function onError(res) {
                if (res.err && res.err.Code) {
                    return emit('validate', getLemonwayMessage(res));
                }
                if (res.err) {
                    emit('validate', getGenericMessage(res));
                }
                err(res);
            }
        });
    }

    function createActions(collectionName, includeClientSideCustomApiActions) {
        includeClientSideCustomApiActions = includeClientSideCustomApiActions == undefined ? true : includeClientSideCustomApiActions;
        var self = {};
        var actions = CONSTANT.COMMON_DATABASE_ACTIONS;

        for (var x in actions) {
            (function(collectionName, actionName) {
                self[actionName] = (data) => {
                    return handle(collectionName, actionName, data);
                };
            })(collectionName, actions[x]);
        }

        if (includeClientSideCustomApiActions && customApiActions[collectionName] !== undefined) {
            Object.keys(customApiActions[collectionName]).forEach(actionName => {
                self[actionName] = (data) => {
                    return appUtils.Promise(function(resolve, reject, emit) {
                        return customApiActions[collectionName][actionName](data, resolve, reject, emit);
                    });
                };
            });
        }

        self.custom = (actionName, data) => {
            return handle(collectionName, actionName, data);
        };

        return self;
    }

    var customApiActions = {};

    var self = {
        addCustomAction: (collectionName, actionName, handler) => {
            customApiActions[collectionName] = customApiActions[collectionName] || {};
            customApiActions[collectionName][actionName] = handler;
        },
        addController: (controllerName, collectionName, customActions) => {
            if (customActions) {
                Object.keys(customActions).forEach(actionName => {
                    self.addCustomAction(collectionName, actionName, customActions[actionName])
                });
            }
            self[controllerName] = createActions(collectionName);
        },
        ctrl: handle,
        updateAttribute: function(table, _id, attrName, attrValue) {
            var payload = {
                _id: _id
            };
            payload[attrName] = attrValue;
            return handle(table, 'update', payload);
        },
        savePrerender: function() {
            var partialRoute = window.location.href.substring(window.location.origin.length + 1);
            partialRoute = appUtils.replaceAll(partialRoute, "/", "--");

            return appUtils.Promise(function(resolve, error) {
                fetch('/app/index.html').then(raw => {
                    if (raw) {
                        var staticContent = window.$('#main-view').html()
                        raw = raw.replaceAll('<div id="main-view" ng-view></div>', '<div id="main-view" ng-view>' + staticContent + '</div>');
                        var encoded = window.encodeURIComponent(raw);
                        return handle('prerender', 'savePrerender', {
                            path: partialRoute,
                            content: encoded
                        });
                    }
                });
            });
        },
        saveImageCloudinary: function(public_id, file) {
            return handle('image', 'saveCloudinary', {
                file: file,
                __cloudinary: {
                    public_id: public_id
                },
                __form: "multer_single"
            });
        },
        subscribe: function(email) {
            return handle('Notification', 'M_SUBSCRIBE', {
                email: email
            });
        },
        delete: function(table, id) {
            return handle(table, 'removeWhen', {
                _id: id
            });
        },
        getById: function(table, id, extraPayload) {
            return handle(table, 'get', Object.assign({
                _id: id
            }, extraPayload || {}));
        },
        getEvent: function(id, extraPayload) {
            return handle('mevent', 'get', Object.assign({
                _id: id
            }, extraPayload || {}));
        },
        saveCollection: function(collectionName, data) {
            return handle(collectionName, 'save', data);
        },
        saveProject: function(data) {
            return handle('project', 'saveProject', data);
        },
        saveTask: function(data) {
            return handle('task', 'saveTask', data);
        },
        saveEvent: function(data) {
            if (!data._id) {
                data.status = 'open';
            }
            return handle('mevent', 'save', data);
        },
        closeEvent: function(data) {
            data = {
                _id: data._id,
                status: 'closed'
            };
            return handle('mevent', 'update', data);
        },
        openEvent: function(data) {
            data = {
                _id: data._id,
                status: 'open'
            };
            return handle('mevent', 'update', data);
        },
        saveProfile: function(data) {
            return handle('muser', 'saveProfile', data);
        },
        signUp: function(data) {
            return handle('muser', 'signUp', data);
        },
        signIn: function(data) {
            return handle('muser', 'signIn', data);
        }
    };

    CONSTANT.COMMON_DATABASE_CONTROLLERS.forEach((controllerName) => {
        self.addController(controllerName, controllerName);
    });


    $rootScope._appApi = self;
    return self;

}]);
