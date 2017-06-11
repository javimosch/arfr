/*global angular*/
/*global $U*/
(function() {
    var dependencies = [
        /*thrid party*/
        'ngRoute',
        //'app.run-calendar',
        //'mwl.calendar',
        'ui.bootstrap',
        //'ui.bootstrap.datetimepicker',
        /*frontstuff*/
        'fs_run',
        'fs_srv_crud',
        'fs_ng_common',
        'fs_srv_common',
        'fs_ng_awesome_complete',
        'fs_ng_checkbox',
        'fs_ng_range',
        'fs_ng_toggle',
        'ng_pikaday',
        'srv_google',
        'srv_stripe',
        'srv_dropdown',

        /*getabiker*/
        'gab_run',

        'gab_ng_order_bikers',
        'gab_ng_tracking',
        'gab_ng_assignment',

        'gab_routes',
        'gab_dashboard',
        'gab_login',
        'gab_profile',
        'gab_order_details',
        'gab_assignment_details',

        'config-replace-brackets',


    ];
    angular.module('gab-dynamic', dependencies);
    angular.module('config-replace-brackets', []).config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
    });
    angular.module('gab-static', [
        'fs_run',
        'fs_ng_common',
        'fs_srv_common',
        'gab_run',
        'gab_contact'
    ]);



})();
