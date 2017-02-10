/*global angular*/
angular.module('app_i18n', []).run(function($rootScope,$log) {
    
}).service('i18n', function($rootScope,$log) {
    
    $rootScope.i18n = window.i18n;
    //$log.debug('i18n moved to rootScope');
    delete window.i18n;
    
    //$log.debug('i18n service started',$rootScope.i18n);
    return $rootScope.i18n;
});
