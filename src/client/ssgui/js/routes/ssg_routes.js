/*global angular*/
/*global SS*/
var srv = angular.module('ssg_routes', []);
srv.config(['$routeProvider',
    function($routeProvider, $rootScope) {


        $routeProvider.

    
        //PUBLIC
        when('/login', {
            templateUrl: '/includes/ssg_login.html'
        }).
        

        //PRIVATE
        when('/', {
            templateUrl: '/includes/ssg_dashboard.html'
        }).
        
        when('/configuration', {
            templateUrl: '/includes/ssg_configuration.html'
        }).
         when('/configuration/:id', {
            templateUrl: '/includes/ssg_configuration_details.html'
        }).
        
        when('/device', {
            templateUrl: '/includes/device/ssg_device.html'
        }).
         when('/device/:id', {
            templateUrl: '/includes/device/ssg_device_details.html'
        }).
        
        /*
        when('/tracking', {
            templateUrl: '/includes/gab_tracking.html'
        }).
        
        when('/assignment', {
            templateUrl: '/includes/gab_assignment.html'
        }).
        
        when('/profile', {
            templateUrl: '/includes/gab_profile.html'
        }).
        
        when('/biker/:id', {
            templateUrl: '/includes/gab_profile.html'
        }).
        
         when('/order/:id', {
            templateUrl: '/includes/gab_order_details.html'
        }).
        */

        
        /*
        when('/settings', {
            templateUrl: '/includes/settings/diags-settings.html'
        }).

        when('/settings-invoice', {
            templateUrl: '/includes/settings/diags-settings-invoice.html'
        }).

        when('/settings-database', {
            templateUrl: '/includes/settings/diags-settings-database.html'
        }).
        
        when('/settings-database-text', {
            templateUrl: '/includes/settings/diags-settings-database-text.html'
        }).

        when('/settings-exportation', {
            templateUrl: '/includes/settings/diags-settings-exportation.html'
        }).

        when('/settings-exportation-orders', {
            templateUrl: '/includes/settings/diags-settings-exportation-orders.html'
        }).

        when('/settings-exportation-texts', {
            templateUrl: '/includes/settings/diags-settings-exportation-texts.html'
        }).

       
      

        when('/notifications', {
            templateUrl: '/includes/notification/notification-list.html'
        }).

        when('/logs', {
            templateUrl: '/includes/log/log-list.html'
        }).
        when('/logs/edit/:id', {
            templateUrl: '/includes/log/log-edit.html'
        }).

        when('/administrators', {
            templateUrl: '/includes/admin/admins.html'
        }).
        when('/administrators/edit/:id', {
            templateUrl: '/includes/admin/admin.edit.html'
        }).

        when('/exceptions', {
            templateUrl: '/includes/exception/exception.list.html'
        }).
        when('/exceptions/edit/:id', {
            templateUrl: '/includes/exception/exception.edit.html'
        }).

        when('/texts', {
            templateUrl: '/includes/text/text-list.html'
        }).
        when('/texts/edit/:id', {
            templateUrl: '/includes/text/text-edit.html'
        }).

        when('/clients', {
            templateUrl: '/includes/client/clients.html'
        }).
        when('/clients/edit/:id', {
            templateUrl: '/includes/client/client.edit.html'
        }).

        when('/price-modifiers', {
            templateUrl: '/includes/price-modifiers.html'
        }).

        when('/documentation', {
            templateUrl: '/includes/diags-docs.html'
        }).



        when('/tools', {
            templateUrl: '/includes/tools.html'
        }).
        when('/tools/termites-check', {
            templateUrl: '/includes/tools.termites-check.html'
        }).

        when('/diag/balance', {
            templateUrl: '/includes/diag/diag-balance.html'
        }).
        when('/diags', {
            templateUrl: '/includes/diag/diags.html'
        }).
        when('/diags/edit/:id', {
            templateUrl: '/includes/diag/diag.edit.html'
        }).
        when('/orders', {
            templateUrl: '/includes/order/orders.html'
        }).
        when('/orders/edit/:id', {
            templateUrl: '/includes/order/order.edit.html'
        }).
        when('/orders/view/:id', {
            templateUrl: '/includes/order/order.view.html'
        }).
        
        */
    
        otherwise({
            redirectTo: '/'
        });
    }
]);
