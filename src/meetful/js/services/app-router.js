/*global angular*/
/*global _*/
var app = angular.module('app_router', []).service('appRouter', ['$rootScope', '$log', '$timeout', '$routeParams', '$location', 'appUtils', 'appSettings', 'appSession', function(r, $log, $timeout, $routeParams, $location, appUtils, appSettings, appSession) {

    var listeners = [];


    function normalizePathForHTML5Routing(path) {
        if (path && path.charAt(0) != '/') path = "/" + path;
        return path;
    }

    function normalizePath(path) {
        //removes first slash if any
        if (path && path.charAt(0) == '/') {
            path = path.substring(1);
        }
        return path;
    }

    function html5RouteTo(path) {
        var link = document.createElement('a');
        link.href = "" + path;
        //$log.debug('ROUTING (HTML5) to ', link.href);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    }

    var self = {
        $location: $location,
        onChange: function(listener) {
            listeners.push(listener);
        },
        to: function(name, params, delay) {
            if (name && name.charAt(0) != '/') name = "/" + name;

            self.params(params);
            $timeout(() => {
                html5RouteTo(name);
            }, delay || 0);
            //r.route(name, delay);
        },
        params: function(newParams) {
            var _params = Object.assign(appSession.getCustom('params') || {}, newParams || {});
            appSession.saveCustom('params', _params);
            return _params;
        },
        clearItem: function() {
            return self.params({
                item: {}
            });
        },
        getId: function() {
            var rta = null;
            var params = this.params();
            if (params.item && params.item._id) {
                rta = params.item._id;
            }
            else {
                rta = $routeParams && $routeParams.id;
            }
            return (rta == -1) ? null : rta;
        }
    }

    self.params(appSession.getCustom('params'));


    //ROUTING
    self.currentPath = window.location.href.substring(window.location.origin.length + 1);
    r.$on("$routeChangeStart", function(event, next, current) {
        var nextPath = normalizePath(next.$$route.originalPath);
        var changeOk = true;
        for (var x in listeners) {
            changeOk = listeners[x](self.currentPath, nextPath);
        }
        if (changeOk) {
            self.previousPath = self.currentPath;
            self.currentPath = nextPath;
        }
        else {
            event.preventDefault();
        }
    });
    r.$on("$routeChangeSuccess", function(event, next, current) {
        //$log.warn(normalizePath(next.$$route.originalPath),'SUCCESS!');
    });

    window._appRouter = self;
    return self;
}]);
