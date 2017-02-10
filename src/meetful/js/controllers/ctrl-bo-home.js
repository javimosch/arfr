/*global angular*/
angular.module('ctrl-bo-home', []).controller('ctrl-bo-home', ['$scope', '$rootScope', 'appApi', 'appGui', '$log', 'appSession', 'appRouter', function(s, r, appApi, appGui, $log, appSession, appRouter) {
    window.s = s;

    s.isAdmin = () => appSession.hasRole('admin');
}]);
