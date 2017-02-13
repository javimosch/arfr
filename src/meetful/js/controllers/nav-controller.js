/*global angular*/
angular.module('ctrl_nav', []).controller('nav', ['$scope', '$rootScope', 'appApi', 'appGui', '$log', 'appSession', 'appRouter', '$location', function(s, r, appApi, appGui, $log, appSession, appRouter, $location) {
    window._nav = s;

    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };
    
    s.isBackoffice = ()=>appRouter.currentPath.indexOf('backoffice')!==-1;

    s.isLogged = function() {
        return appSession.isLogged();
    };
    s.isActive = function(viewLocation) {
        viewLocation = viewLocation.replaceAll('/', '');
        var path = $location.path().replaceAll('/', '');
        if (!path) {
            var n = window.location.href;
            if (n.charAt(n.length - 1) == '/') n = n.substring(0, n.length - 1);
            n = n.substring(n.lastIndexOf('/')).replace('/', '');
            n = n.replaceAll('/', '');
            path = n;
        }
        return viewLocation.toLowerCase() === path.toLowerCase();
    };
}]);
