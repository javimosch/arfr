/*global angular*/
var app = angular.module('service-app-settings', []).service('appSettings', ['$rootScope', '$log', '$timeout', function(r, $log, $timeout) {
    var self = {
        URL: window.location.origin+'/'
    };
    if(window.__settings){
        for(var x in window.__settings){
            self[x] = window.__settings[x];
        }
        delete window.__settings;
    }
    window._appSettings = self;
    return self;
}]);
