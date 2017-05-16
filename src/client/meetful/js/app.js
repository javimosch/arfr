/*global angular*/
angular.module('app', [
    'ui.bootstrap',
    'bw.paging',
    'ngRoute',
    'pretty-checkable',
    'moment-picker',
    'vsGoogleAutocomplete',
    'cloudinary',
    
    
    'cloudinary-config',
    'config-replace-brackets',
    'config-app-router',
    
    'run-route-change-middleware',
    'run-api-meetful-event',
    'run-api-meetful-user',
    
    /*THIRD PARTY DIRECTIVES*/
    'ui-listView',
    
    'directive-event-listview',
    'directive-projects-listview',
    'directive-dynamic-table',
    'directive-bind-html-compile',
    'directive-tasks-listview',
    'directive-file-model',
    'directive-user-listview',
    'directive-log-listview',
    'directive-prerender-listview',
    'directive-static-href',
    'directive-i18n-listview',
    
    'service-file-upload',
    'service-app-basic-crud',
    'ace-editor-service',
    
    'service-app-i18n',
    'service-app-utils',
    'service-app-api',
    'service-app-api-paginator',
    'service-app-settings',
    'service-app-run-helpers',
    'service-app-gui',
    'service-app-notify',
    'service-app-session',
    'service-app-router',
    
    'ctrl-sign-in',
    'ctrl-sign-up',
    'ctrl-nav',
    'ctrl-profile',
    'ctrl-dashboard',
    'ctrl-event',
    'ctrl-project',
    'ctrl-task',
    'ctrl-subscribe',
    
    'ctrl-bo-home',
    'ctrl-bo-log',
    'ctrl-bo-user',
    'ctrl-bo-prerender',
    'ctrl-bo-i18n',
    'ctrl-bo-setup',
    'ctrl-bo-pages'
]);

/*global angular*/
angular.module('app-static', [
    //'ui.bootstrap',
    'ngRoute',
    'config-replace-brackets',
//    'config-app-router',
    
    'directive-event-listview',
    'directive-dynamic-table',
    'directive-bind-html-compile',
    
    
    
    'service-app-i18n',
    'service-app-utils',
    //'service-app-api',
    //'service-app-api-paginator',
    'service-app-settings',
    'service-app-run-helpers',
    'service-app-gui',
    'service-app-notify',
    'service-app-session',
    'service-app-router',

    'ctrl-nav',
]);
