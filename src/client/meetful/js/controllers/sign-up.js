/*global angular*/
/*global i18n*/
angular.module('ctrl-sign-up', []).controller('signUp', ['$scope', '$rootScope', 'appApi', 'appGui', '$log', 'appSession', 'appRouter','i18n', function(s, r, appApi, appGui, $log, appSession, appRouter,i18n) {
    window.s = s;
    s.item = {
        email: '',
        password: ''
    };
    s.signUp = function() {
        appApi.signUp(s.item).then(function(result) {
            appSession(result);
            if (appSession()._id) {
                
                if(appRouter.params().userIsTryingToCreateAnEvent){
                    
                    return appRouter.to(i18n.ROUTE_CREATE_EVENT);
                }
                
                appRouter.to(i18n.ROUTE_DASHBOARD);
            }
        }).error(function(res) {
            appGui.errorMessage();
        }).on('validate', function(msg) {
            appGui.warningMessage(msg);
        });
    };
    s.isValid = function() {
        if (!s.item.email) return false;
        if (!s.item.password) return false;
        return true;
    }
}]);
