/*global angular*/
/*global SS*/
var srv = angular.module('ssg_routes', []);
srv.config(['$routeProvider',
    function($routeProvider, $rootScope) {


        $routeProvider.

    
        //PUBLIC
        when('/login', {
            templateUrl: '/templates/ssg_login.html'
        }).
        

        //PRIVATE
        when('/', {
            templateUrl: '/templates/ssg_dashboard.html'
        }).
        
        when('/configuration', {
            templateUrl: '/templates/ssg_configuration.html'
        }).
         when('/configuration/:id', {
            templateUrl: '/templates/ssg_configuration_details.html'
        }).
        
        when('/device', {
            templateUrl: '/templates/device/ssg_device.html'
        }).
         when('/device/:id', {
            templateUrl: '/templates/device/ssg_device_details.html'
        }).
        
        /*
        when('/tracking', {
            templateUrl: '/templates/gab_tracking.html'
        }).
        
        when('/assignment', {
            templateUrl: '/templates/gab_assignment.html'
        }).
        
        when('/profile', {
            templateUrl: '/templates/gab_profile.html'
        }).
        
        when('/biker/:id', {
            templateUrl: '/templates/gab_profile.html'
        }).
        
         when('/order/:id', {
            templateUrl: '/templates/gab_order_details.html'
        }).
        */

        
        /*
        when('/settings', {
            templateUrl: '/templates/settings/diags-settings.html'
        }).

        when('/settings-invoice', {
            templateUrl: '/templates/settings/diags-settings-invoice.html'
        }).

        when('/settings-database', {
            templateUrl: '/templates/settings/diags-settings-database.html'
        }).
        
        when('/settings-database-text', {
            templateUrl: '/templates/settings/diags-settings-database-text.html'
        }).

        when('/settings-exportation', {
            templateUrl: '/templates/settings/diags-settings-exportation.html'
        }).

        when('/settings-exportation-orders', {
            templateUrl: '/templates/settings/diags-settings-exportation-orders.html'
        }).

        when('/settings-exportation-texts', {
            templateUrl: '/templates/settings/diags-settings-exportation-texts.html'
        }).

       
      

        when('/notifications', {
            templateUrl: '/templates/notification/notification-list.html'
        }).

        when('/logs', {
            templateUrl: '/templates/log/log-list.html'
        }).
        when('/logs/edit/:id', {
            templateUrl: '/templates/log/log-edit.html'
        }).

        when('/administrators', {
            templateUrl: '/templates/admin/admins.html'
        }).
        when('/administrators/edit/:id', {
            templateUrl: '/templates/admin/admin.edit.html'
        }).

        when('/exceptions', {
            templateUrl: '/templates/exception/exception.list.html'
        }).
        when('/exceptions/edit/:id', {
            templateUrl: '/templates/exception/exception.edit.html'
        }).

        when('/texts', {
            templateUrl: '/templates/text/text-list.html'
        }).
        when('/texts/edit/:id', {
            templateUrl: '/templates/text/text-edit.html'
        }).

        when('/clients', {
            templateUrl: '/templates/client/clients.html'
        }).
        when('/clients/edit/:id', {
            templateUrl: '/templates/client/client.edit.html'
        }).

        when('/price-modifiers', {
            templateUrl: '/templates/price-modifiers.html'
        }).

        when('/documentation', {
            templateUrl: '/templates/diags-docs.html'
        }).



        when('/tools', {
            templateUrl: '/templates/tools.html'
        }).
        when('/tools/termites-check', {
            templateUrl: '/templates/tools.termites-check.html'
        }).

        when('/diag/balance', {
            templateUrl: '/templates/diag/diag-balance.html'
        }).
        when('/diags', {
            templateUrl: '/templates/diag/diags.html'
        }).
        when('/diags/edit/:id', {
            templateUrl: '/templates/diag/diag.edit.html'
        }).
        when('/orders', {
            templateUrl: '/templates/order/orders.html'
        }).
        when('/orders/edit/:id', {
            templateUrl: '/templates/order/order.edit.html'
        }).
        when('/orders/view/:id', {
            templateUrl: '/templates/order/order.view.html'
        }).
        
        */
    
        otherwise({
            redirectTo: '/'
        });
    }
]);
