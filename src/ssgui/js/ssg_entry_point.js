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
        //'srv_google',
        //'srv_stripe',
        //'srv_dropdown',
        /*ssg*/
        'ssg_run',
        //'gab_ng_order_bikers',
        //'gab_ng_tracking',
        //'gab_ng_assignment',
        'ssg_routes',
        'ssg_ng_table',
        'ssg_configuration',
        'ssg_device',
        //'gab_dashboard',
        //'gab_login',
        //'gab_profile',
        //'gab_order_details',
        //'gab_assignment_details',
    ];
    angular.module('ssg-dynamic', dependencies);
    angular.module('ssg-static', [
            'fs_run',
            'fs_ng_common',
            'fs_srv_common',
            'gab_run',
            'gab_contact'
        ]);
    
    
    
})();

