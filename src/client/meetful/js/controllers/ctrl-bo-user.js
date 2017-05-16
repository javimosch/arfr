/*global angular*/
angular.module('ctrl-bo-user', []).controller('ctrl-bo-user', ['$scope', '$rootScope', 'appApi', 'appGui', '$log', 'appSession', 'appRouter', 'appBasicCrud', '$routeParams', function(s, r, appApi, appGui, $log, appSession, appRouter, appBasicCrud, $routeParams) {
    window.s = s;

    s.showToggleAdminRights = () => s.data && s.isAdmin && s.isAdmin();
    s.toggleAdminRights = function() {
        s.data.roles = s.data.roles || [];
        if (s.data && s.data.roles && s.data.roles.includes('admin')) {
            s.data.roles = s.data.roles.filter(v => v !== 'admin');
        }
        else {
            s.data.roles.push('admin');
        }
        s.save();
    };
    s.toggleAdminRightsLabel = () => {
        if (s.data && s.data.roles && s.data.roles.includes('admin')) {
            return "Revoke admin";
        }
        else {
            return "Grant admin";
        }
    }

    appBasicCrud({
        collectionName: "muser",
        scope: s,
        $routeParams: $routeParams,
        payloads: {
            get: {
                __select: "first_name last_name email roles"
            }
        },
        actions: {
            save: true
        }
    });

}]);
