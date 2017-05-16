/*global angular*/
angular.module('ctrl-dashboard', []).controller('dashboard', ['$scope', '$rootScope', 'appApi', 'appGui', '$log','appSession','appRouter','i18n', function(s, r, appApi, appGui, $log,appSession,appRouter,i18n) {
    window.s = s;
    s.item = {
        email: '',
        password: ''
    };
    s.signIn = function() {
        appApi.signIn(s.item).then(function(result) {
            if(result){
                appSession(result);
                appRouter.to(i18n.ROUTE_DASHBOARD);
            }else{
                appGui.warningMessage('Invalid credentials');
            }
            appGui.dom();
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
