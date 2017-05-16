/*global angular*/
/*global $U*/
(function() {
    var app = angular.module('app', [
        'app.run',
        'ngRoute',
        //'app.run-calendar',
        /// 'mwl.calendar',
        //'ui.bootstrap',
        //'ui.bootstrap.datetimepicker',
        'app.services',
        'app.directives',
        'home-ctrl',
        'vf-home-ctrl',
        'vf-booking-ctrl',
        'vf-auth-ctrl',
        /*
        'srv.crud',
        'app.admin',
        'app.routes',
        'app.login',
        'app.user',
        'app.diag',
        'app.log',
        'app.diag.complete',
        'app.diag.balance',
        'app.order',
        'app.client',
        'app.diag',
        'app.calendar',
        'app.notifications',
        'app.client.payments',
        
        
        'app.tools'
        */
    ]);
    app.config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
    });
    $U.expose('app', app);
})();
