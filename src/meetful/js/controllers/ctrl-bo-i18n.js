/*global angular*/
angular.module('ctrl-bo-i18n', []).controller('ctrl-bo-i18n', ['$scope', '$rootScope', 'appApi', 'appGui', '$log', 'appSession', 'appRouter', 'appBasicCrud','$routeParams', function(s, r, appApi, appGui, $log, appSession, appRouter, appBasicCrud,$routeParams) {
    window.s = s;

    appBasicCrud({
        collectionName:"i18n",
        scope: s,
        $routeParams:$routeParams,
        actions:{
            save:false
        }
    });

}]);
