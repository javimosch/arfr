/*global angular*/
angular.module('ctrl_subscribe', []).controller('subscribe', ['$scope', '$rootScope', 'appApi', 'appGui', '$log', 'appSession', 'appRouter','i18n', function(s, r, appApi, appGui, $log, appSession, appRouter,i18n) {
    window.s = s;
    s.item = {
        email: '',
        password: ''
    };
    s.subscribe = function() {
        appApi.subscribe(s.item.email).then(function(result) {
            appGui.successMessage(i18n.TEXT_SUBSCRIBE_SUCCESS);
        }).error(function(res) {
            appGui.errorMessage();
        }).on('validate', function(msg) {
            $log.debug(msg);
            appGui.warningMessage(msg);
        });
    };
    s.isValid = function() {
        if (!s.item.email) return false;
        return true;
    }
}]);
