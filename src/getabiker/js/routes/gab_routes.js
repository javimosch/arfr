/*global angular*/
/*global SS*/
var srv = angular.module('gab_routes', []);
srv.config(['$routeProvider',
    function($routeProvider, $rootScope) {


        $routeProvider.

    
        //PUBLIC
        when('/login', {
            templateUrl: SS.ROOT+'templates/gab_login.html'
        }).
        

        //PRIVATE
        when('/', {
            templateUrl: SS.ROOT+'templates/gab_dashboard.html'
        }).
        
        when('/tracking', {
            templateUrl: SS.ROOT+'templates/gab_tracking.html'
        }).
        
        when('/assignment', {
            templateUrl: SS.ROOT+'templates/gab_assignment.html'
        }).
        
        when('/profile', {
            templateUrl: SS.ROOT+'templates/gab_profile.html'
        }).
        
        when('/biker/:id', {
            templateUrl: SS.ROOT+'templates/gab_profile.html'
        }).
        
         when('/order/:id', {
            templateUrl: SS.ROOT+'templates/gab_order_details.html'
        }).

        
        /*
        when('/settings', {
            templateUrl: SS.ROOT+'templates/settings/diags-settings.html'
        }).

        when('/settings-invoice', {
            templateUrl: SS.ROOT+'templates/settings/diags-settings-invoice.html'
        }).

        when('/settings-database', {
            templateUrl: SS.ROOT+'templates/settings/diags-settings-database.html'
        }).
        
        when('/settings-database-text', {
            templateUrl: SS.ROOT+'templates/settings/diags-settings-database-text.html'
        }).

        when('/settings-exportation', {
            templateUrl: SS.ROOT+'templates/settings/diags-settings-exportation.html'
        }).

        when('/settings-exportation-orders', {
            templateUrl: SS.ROOT+'templates/settings/diags-settings-exportation-orders.html'
        }).

        when('/settings-exportation-texts', {
            templateUrl: SS.ROOT+'templates/settings/diags-settings-exportation-texts.html'
        }).

       
      

        when('/notifications', {
            templateUrl: SS.ROOT+'templates/notification/notification-list.html'
        }).

        when('/logs', {
            templateUrl: SS.ROOT+'templates/log/log-list.html'
        }).
        when('/logs/edit/:id', {
            templateUrl: SS.ROOT+'templates/log/log-edit.html'
        }).

        when('/administrators', {
            templateUrl: SS.ROOT+'templates/admin/admins.html'
        }).
        when('/administrators/edit/:id', {
            templateUrl: SS.ROOT+'templates/admin/admin.edit.html'
        }).

        when('/exceptions', {
            templateUrl: SS.ROOT+'templates/exception/exception.list.html'
        }).
        when('/exceptions/edit/:id', {
            templateUrl: SS.ROOT+'templates/exception/exception.edit.html'
        }).

        when('/texts', {
            templateUrl: SS.ROOT+'templates/text/text-list.html'
        }).
        when('/texts/edit/:id', {
            templateUrl: SS.ROOT+'templates/text/text-edit.html'
        }).

        when('/clients', {
            templateUrl: SS.ROOT+'templates/client/clients.html'
        }).
        when('/clients/edit/:id', {
            templateUrl: SS.ROOT+'templates/client/client.edit.html'
        }).

        when('/price-modifiers', {
            templateUrl: SS.ROOT+'templates/price-modifiers.html'
        }).

        when('/documentation', {
            templateUrl: SS.ROOT+'templates/diags-docs.html'
        }).



        when('/tools', {
            templateUrl: SS.ROOT+'templates/tools.html'
        }).
        when('/tools/termites-check', {
            templateUrl: SS.ROOT+'templates/tools.termites-check.html'
        }).

        when('/diag/balance', {
            templateUrl: SS.ROOT+'templates/diag/diag-balance.html'
        }).
        when('/diags', {
            templateUrl: SS.ROOT+'templates/diag/diags.html'
        }).
        when('/diags/edit/:id', {
            templateUrl: SS.ROOT+'templates/diag/diag.edit.html'
        }).
        when('/orders', {
            templateUrl: SS.ROOT+'templates/order/orders.html'
        }).
        when('/orders/edit/:id', {
            templateUrl: SS.ROOT+'templates/order/order.edit.html'
        }).
        when('/orders/view/:id', {
            templateUrl: SS.ROOT+'templates/order/order.view.html'
        }).
        
        */
    
        otherwise({
            redirectTo: '/'
        });
    }
]);
