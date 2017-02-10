/*global angular*/
angular.module('ctrl_task', []).controller('task', ['$scope', '$rootScope', 'appApi', 'appGui', '$log', 'appSession', 'appRouter', function(s, r, appApi, appGui, $log, appSession, appRouter) {
    window.s = s;

    s.data = {
        _project: appSession.getMetadata() && appSession.getMetadata().project
    };

    //Save
    s.save = function() {
        if (!isValid()) return;
        appApi.saveTask(s.data).then(function(saveData) {
            s.data = saveData;
            s.data._project = appSession.getMetadata() && appSession.getMetadata().project;
            appGui.infoMessage("Saved");
        }).error(function(res) {
            appGui.errorMessage();
        }).on('validate', function(msg) {
            appGui.warningMessage(msg);
        });
    };

    //isValid
    function isValid() {
        //if (!s.data.name) return appGui.warningMessage('name required');
        if (!s.data.short_description) return appGui.warningMessage('short_description required');
        if (!s.data._project) return appGui.warningMessage('_project required');
        return true;
    }


    //Read
    if (appRouter.getId()) {
        appApi.getById('task', appRouter.getId(),{
            __populate:{
                _project:"_id name"
            }
        }).then((r) => {
            s.data = r;
        })
    }
    
    s.delete = ()=>{
        if(appSession.hasRole('admin')){
            if(window.confirm('Delete '+(s.data.number?'Task #'+s.data.number:"Task ID "+s.data.code)+' ?')){
                appApi.delete('task',s.data._id).then(()=>appRouter.to(s.backHref()));
            }
        }
    }

    s.backHref = () => {
        if (s.data && s.data._project && s.data._project._id) {
            return '/project-manager/' + s.data._project._id;
        }
        else {
            return '/project-manager';
        }
    };
}]);
