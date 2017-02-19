/*global angular*/
angular.module('ctrl-profile', []).controller('profile', ['$scope', '$rootScope', 'appApi', 'appGui', '$log', 'appSession', 'appRouter', '$routeParams', function(s, r, appApi, appGui, $log, appSession, appRouter, $routeParams) {
    window.s = s;

    s.logout = () => appSession.logout();

    s.item = {};
    
    s.showSave = ()=> appSession() && appSession()._id == s.item._id;
    s.save = function() {
        if (!isValid()) return;
        appApi.saveProfile(s.item).then(function(result) {
            appGui.infoMessage("Saved");
        }).error(function(res) {
            appGui.errorMessage();
        }).on('validate', function(msg) {
            appGui.warningMessage(msg);
        });
    };

    s.grantAdmin = function() {
        s.item.roles = s.item.roles || [];
        s.item.roles.push('admin');
        s.save();
    };

    s.pictures = {
        picture_1: "",
        picture_2: "",
        picture_3: ""
    };

    s.onPictureSelect = function(name) {
        var public_id = 'meetful/user/' + s.item.email + '/' + name;

        var label = s.pictures[name].name;

        appApi.saveImageCloudinary(public_id, s.pictures[name]).then(res => {
            //$log.log(res);
            s.item.pictures = s.item.pictures || {};
            s.item.pictures[name] = {
                public_id: res.cloudinary.public_id,
                label: label,
                version: res.cloudinary.version
            };

            appApi.updateAttribute('muser', s.item._id, 'pictures', s.item.pictures);

        }).on('validate', (msg) => {
            appGui.warningMessage(msg);
        });
    };
    s.openInTab = function(name) {
        var url = 'https://res.cloudinary.com/paris7510/image/upload/v{{version}}/{{public_id}}.jpg'
        url = url.replace('{{version}}', s.item.pictures[name].version);
        url = url.replace('{{public_id}}', s.item.pictures[name].public_id);
        var win = window.open(url, '_blank');
        win.focus();
    };
    s.hasPictures = function() {
        return s.item && s.item.pictures != undefined;
    };
    s.hasPicture = function(name) {
        return s.item && s.item.pictures && s.item.pictures[name] != undefined;
    };
    s.fileInputLabel = function(name) {
        if (s.hasPicture(name)) return s.item.pictures[name].label;
        return name + ' ...';
    };

    s.selectImage = function(n) {
        if (s._selectedImage == n) return (s._selectedImage = '');
        s._selectedImage = n;
    };

    s.isAdmin = () => appSession.hasRole('admin');
    s.showProjectManagerButton = () => appSession.hasRole('admin');
    s.clickProjectManagerButton = () => appRouter.to('project-manager');

    function isValid() {
        if (!s.item.password) return appGui.warningMessage('Password required.');
        if (!s.item.first_name) return appGui.warningMessage('First Name required.');
        return true;
    };

    read();

    function read(id) {
        var getPayload = {
            _id: appSession()._id
        };
        if ($routeParams.id) {
            getPayload._id = $routeParams.id;
        }
        if ($routeParams.url) {
            getPayload.url = $routeParams.url;
        }
        appApi.ctrl('muser', 'get', getPayload).then(function(res) {
            $log.log(res);
            s.item = res;
        });
    }





}]);
