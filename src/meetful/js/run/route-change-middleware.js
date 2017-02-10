/*global angular*/
angular.module('run-route-change-middleware', []).run(['$timeout', '$rootScope', 'appApi', 'i18n', '$log', 'appRouter', 'appSession', function($timeout, r, appApi, i18n, $log, appRouter, appSession) {

    appRouter.onChange(function(current, next) {
        $log.debug(current, 'to', next);

        /*    //LOGGED? DASHBOARD
         if (next.indexOf(i18n.ROUTE_SIGN_IN) != -1 && r.logged()) {
             event.preventDefault();
             r.route(i18n.ROUTE_DASHBOARD);
         }
         
         */

        if (next == i18n.ROUTE_CREATE_EVENT && !appSession.isLogged()) {
            appRouter.to(i18n.ROUTE_SIGN_IN, {
                userIsTryingToCreateAnEvent: true
            }, 500);
            $log.debug('SHOULD BE LOGGED, ROUTE TO SIGN_IN');
            return false;
        }

        return true;
    });

    appSession.onLogout(function() {
        appRouter.to('/' + i18n.ROUTE_SIGN_IN, {

        });
    });

}]);
