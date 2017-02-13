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
            save: false
        }
    });

    appApi.texts.custom('i18nConfig', {
        appName: appSettings.appName
    }).then(config => {
        $log.log('config', config);
    }).on('validate', (msg) => {
        appGui.warningMessage(msg);
    });

}]);
