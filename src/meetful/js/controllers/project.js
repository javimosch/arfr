/*global angular*/
angular.module('ctrl_project', []).controller('project', ['$scope', '$rootScope', 'appApi', 'appGui', '$log', 'appSession', 'appRouter', function(s, r, appApi, appGui, $log, appSession, appRouter) {
    window.s = s;

    s.data = {};

    //Save
    s.save = function() {
        if (!isValid()) return;
        appApi.saveProject(s.data).then(function(saveData) {
            s.data = saveData;
            appGui.infoMessage("Saved");
        }).error(function(res) {
            appGui.errorMessage();
        }).on('validate', function(msg) {
            appGui.warningMessage(msg);
        });
    };

    //isValid
    function isValid() {
        if (!s.data.name) return appGui.warningMessage('name required');
        if (!s.data.short_description) return appGui.warningMessage('short_description required');
        return true;
    }


    //Read
    if (appRouter.getId()) {
        appApi.getById('project', appRouter.getId()).then((r) => {
            s.data = r;
        })
    }
    
    s.clickBack=()=>appRouter.to('project-manager');
}]);
