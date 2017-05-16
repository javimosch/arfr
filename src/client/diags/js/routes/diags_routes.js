/*global angular*/
var srv = angular.module('app.routes', []);
srv.config(['$routeProvider',
    function($routeProvider, $rootScope) {


        $routeProvider.

        //SHARED
        when('/mentions-legales', {
            templateUrl: 'views/diags/legal-mentions.html'
        }).
        when('/conditions-generales-utilisation', {
            templateUrl: 'views/diags/general-conditions.html'
        }).
        when('/ernt', {
            templateUrl: 'views/diags/ernmt.html'
        }).
        when('/faq', {
            templateUrl: 'views/diags/faq.html'
        }).
        when('/contactez-nous', {
            templateUrl: 'views/diags/contact-us.html'
        }).

        //PUBLIC
        when('/login', {
            templateUrl: 'views/diags/login.html'
        }).
        when('/diag-inscription', {
            templateUrl: 'views/diags/diag-inscription.html'
        }).

        //PRIVATE
        when('/', {
            templateUrl: 'views/diags/backoffice/dashboard.html'
        }).
        when('/dashboard', {
            templateUrl: 'views/diags/backoffice/dashboard.html'
        }).
        when('/global-calendar', {
            templateUrl: 'views/diags/backoffice/global-calendar.html'
        }).

        when('/settings', {
            templateUrl: 'views/diags/backoffice/settings/diags-settings.html'
        }).

        when('/settings-invoice', {
            templateUrl: 'views/diags/backoffice/settings/diags-settings-invoice.html'
        }).

        when('/settings-database', {
            templateUrl: 'views/diags/backoffice/settings/diags-settings-database.html'
        }).
        
        when('/settings-database-text', {
            templateUrl: 'views/diags/backoffice/settings/diags-settings-database-text.html'
        }).

        when('/settings-exportation', {
            templateUrl: 'views/diags/backoffice/settings/diags-settings-exportation.html'
        }).

        when('/settings-exportation-orders', {
            templateUrl: 'views/diags/backoffice/settings/diags-settings-exportation-orders.html'
        }).

        when('/settings-exportation-texts', {
            templateUrl: 'views/diags/backoffice/settings/diags-settings-exportation-texts.html'
        }).

       
      

        when('/notifications', {
            templateUrl: 'views/diags/backoffice/notification/notification-list.html'
        }).

        when('/logs', {
            templateUrl: 'views/diags/backoffice/log/log-list.html'
        }).
        when('/logs/edit/:id', {
            templateUrl: 'views/diags/backoffice/log/log-edit.html'
        }).

        when('/administrators', {
            templateUrl: 'views/diags/backoffice/admin/admins.html'
        }).
        when('/administrators/edit/:id', {
            templateUrl: 'views/diags/backoffice/admin/admin.edit.html'
        }).

        when('/exceptions', {
            templateUrl: 'views/diags/backoffice/exception/exception.list.html'
        }).
        when('/exceptions/edit/:id', {
            templateUrl: 'views/diags/backoffice/exception/exception.edit.html'
        }).

        when('/texts', {
            templateUrl: 'views/diags/backoffice/text/text-list.html'
        }).
        when('/texts/edit/:id', {
            templateUrl: 'views/diags/backoffice/text/text-edit.html'
        }).

        when('/clients', {
            templateUrl: 'views/diags/backoffice/client/clients.html'
        }).
        when('/clients/edit/:id', {
            templateUrl: 'views/diags/backoffice/client/client.edit.html'
        }).

        when('/price-modifiers', {
            templateUrl: 'views/diags/backoffice/price-modifiers.html'
        }).

        when('/documentation', {
            templateUrl: 'views/diags/backoffice/diags-docs.html'
        }).



        when('/tools', {
            templateUrl: 'views/diags/backoffice/tools.html'
        }).
        when('/tools/termites-check', {
            templateUrl: 'views/diags/backoffice/tools.termites-check.html'
        }).

        when('/diag/balance', {
            templateUrl: 'views/diags/backoffice/diag/diag-balance.html'
        }).
        when('/diags', {
            templateUrl: 'views/diags/backoffice/diag/diags.html'
        }).
        when('/diags/edit/:id', {
            templateUrl: 'views/diags/backoffice/diag/diag.edit.html'
        }).
        when('/orders', {
            templateUrl: 'views/diags/backoffice/order/orders.html'
        }).
        when('/orders/edit/:id', {
            templateUrl: 'views/diags/backoffice/order/order.edit.html'
        }).
        when('/orders/view/:id', {
            templateUrl: 'views/diags/backoffice/order/order.view.html'
        }).
        otherwise({
            redirectTo: '/'
        });
        //console.info('app.admin.routes:config');
    }
]);
