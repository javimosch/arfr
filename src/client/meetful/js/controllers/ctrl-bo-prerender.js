/*global angular*/
angular.module('ctrl-bo-prerender', []).controller('ctrl-bo-prerender', ['$scope', '$rootScope', 'appApi', 'appGui', '$log', 'appSession', 'appRouter', 'appBasicCrud','$routeParams', function(s, r, appApi, appGui, $log, appSession, appRouter, appBasicCrud,$routeParams) {
    window.s = s;

    appBasicCrud({
        collectionName:"prerender",
        scope: s,
        $routeParams:$routeParams,
        actions:{
            save:false
        }
    });
    
    s.renderContent = ()=> s.data && s.data.content && window.decodeURIComponent(s.data.content);

}]);
