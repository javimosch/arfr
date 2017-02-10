/*global angular*/
angular.module('ctrl-bo-log', []).controller('ctrl-bo-log', ['$scope', '$rootScope', 'appApi', 'appGui', '$log', 'appSession', 'appRouter', 'appBasicCrud','$routeParams', function(s, r, appApi, appGui, $log, appSession, appRouter, appBasicCrud,$routeParams) {
    window.s = s;

    appBasicCrud({
        collectionName:"log",
        scope: s,
        $routeParams:$routeParams,
        actions:{
            save:false
        }
    });

}]);
