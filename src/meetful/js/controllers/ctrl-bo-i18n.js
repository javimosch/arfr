/*global angular*/
angular.module('ctrl-bo-i18n', []).controller('ctrl-bo-i18n', ['$scope', '$rootScope', 'appApi', 'appGui', '$log', 'appSession', 'appRouter', 'appBasicCrud', '$routeParams', 'appSettings', function(s, r, appApi, appGui, $log, appSession, appRouter, appBasicCrud, $routeParams, appSettings) {
    window.s = s;

    appBasicCrud({
        collectionName: "texts",
        scope: s,
        $routeParams: $routeParams,
        payloads: {
            get: {
                __populate: [{
                    path: "_category",
                    model: 'categories'
                }]
            }
        },
        get: {
            field: 'code'
        },
        actions: {
            save: true
        },
        validate: {
            save: (data, next) => {
                if (!data.code) return appGui.warningMessage('Code required');
                if (!data.content) return appGui.warningMessage('Content description');
                if (!data._category) return appGui.warningMessage('i18n category should be set first.');


                return appApi.texts.exists(Object.assign({
                    code: data.code
                }, s.isEdit() ? {
                    __rules: {
                        _id: {
                            $ne: data._id
                        }
                    }
                } : {})).then(exists => {
                    if (exists) return appGui.warningMessage('Code already exists for another registry.');
                    next();
                });


                next();
            }
        }
    });

    appApi.categories.get({
        code: 'i18n'
    }).then(res => {
        s.data._category = res._id;
    });

    s.encode = () => {
        s.data.content = window.encodeURIComponent(s.data.content);
    };
    s.decode = () => {
        s.data.content = window.decodeURIComponent(s.data.content);
    };

    appApi.texts.custom('i18nConfig', {
        appName: appSettings.appName
    }).then(config => {
        //$log.log('config', config);
        if(config && config.languages){
            s.languages = config.languages;
        }
    }).on('validate', (msg) => {
        appGui.warningMessage(msg);
    });

}]);
