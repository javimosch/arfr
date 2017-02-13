/*global angular*/
angular.module('app', [
    'ui.bootstrap',
    'ngRoute',
    'moment-picker',
    'vsGoogleAutocomplete',
    'cloudinary',
    
    'cloudinary-config',
    'config-replace-brackets',
    'config_app_router',
    
    'run-route-change-middleware',
    'run-api-meetful-event',
    'run-api-meetful-user',
    
    'directive_event_listview',
    'directive_projects_listview',
    'directive_dynamic_table',
    'directive_bind_html_compile',
    'directive_tasks_listview',
    'directive_file-model',
    'directive-user-listview',
    'directive-log-listview',
    'directive-prerender-listview',
    'directive-static-href',
    'directive-i18n-listview',
    
    'service_file-upload',
    'service-app-basic-crud',
    
    
    'app_i18n',
    'app_utils',
    'app_api',
    'app_api_paginator',
    'app_settings',
    'app_run_helpers',
    'app_gui',
    'app_notify',
    'app_session',
    'app_router',
    
    'ctrl_sign_in',
    'ctrl_sign_up',
    'ctrl_nav',
    'ctrl_profile',
    'ctrl_dashboard',
    'ctrl-event',
    'ctrl_project',
    'ctrl_task',
    'ctrl_subscribe',
    
    'ctrl-bo-home',
    'ctrl-bo-log',
    'ctrl-bo-user',
    'ctrl-bo-prerender',
    'ctrl-bo-i18n',
    'ctrl-bo-setup'
]);

/*global angular*/
angular.module('app-static', [
    //'ui.bootstrap',
    'ngRoute',
    'config-replace-brackets',
//    'config_app_router',
    
    'directive_event_listview',
    'directive_dynamic_table',
    'directive_bind_html_compile',
    
    
    
    'app_i18n',
    'app_utils',
    //'app_api',
    //'app_api_paginator',
    'app_settings',
    'app_run_helpers',
    'app_gui',
    'app_notify',
    'app_session',
    'app_router',

    'ctrl_nav',
]);
