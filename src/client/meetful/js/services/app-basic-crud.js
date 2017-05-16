/*global angular*/
/*global _*/
/*global moment*/
/*global $U*/
angular.module('service-app-basic-crud', []).service('appBasicCrud', ['$rootScope', '$log', 'appUtils', 'appSettings', 'fileUpload', 'appApi', 'appGui', 'appRouter', 'appSession', function($rootScope, $log, appUtils, appSettings, fileUpload, appApi, appGui, appRouter, appSession) {
    const TEXT = {
        DATA_SAVED: 'Saved',
        GENERIC_ERROR: '',
        WARNING_ERROR: ''
    };
    var self = function(settings) {
        var s = settings.scope;
        s.isBasicCrud = true;
        s.data = {};
        s.save = function() {

            if (settings && settings.validate && settings.validate.save) {
                settings.validate.save(s.data, () => {
                    _save();
                });
            }
            else {
                $log.warn('no-validate', settings);
                _save();
            }

            function _save() {
                //if (!s.data.address) return appGui.warningMessage(MESSAGE.ADDRESS_REQUIRED);
                appApi.saveCollection(settings.collectionName, s.data).then(function(result) {
                    s.data = result;
                    appGui.infoMessage(TEXT.DATA_SAVED);
                }).error(function(res) {
                    appGui.errorMessage(TEXT.GENERIC_ERROR);
                }).on('validate', function(msg) {
                    appGui.warningMessage(TEXT.WARNING_ERROR || msg);
                });
            }
        };
        s.isEdit = () => {
            return s.data && s.data._id;
        };
        s.isDetailView = () => s._isDetailView || false;
        s.isAdmin = () => appSession.hasRole('admin');
        s.showSave = () => {
            return settings.actions && settings.actions.save;
        };
        s.isNew = () => s.data && !s.data._id;

        function get_id() {
            var params = appRouter.params();
            if (params.item && params.item._id) {
                return params.item._id;
            }
            else {
                return settings.$routeParams && settings.$routeParams.id;
            }
        }

        function onFetchSuccess(result) {
            s.data = result;
            appRouter.clearItem();
        }

        var _id = get_id();
        if (_id && _id.toString() != '-1' && _id.toString() != 'new') {
            var payload = Object.assign({}, settings.payloads && settings.payloads.get || {});
            if (!settings.get || !settings.get.field) {
                appApi.getById(settings.collectionName, _id, payload).then(onFetchSuccess);
            }
            else {
                payload[settings.get.field] = _id;
                appApi.ctrl(settings.collectionName, 'get', payload).then(onFetchSuccess);
            }
            s._isDetailView = true;
            s.$emit('basic-crud-loaded');
        }
        else {

            if (_id.toString() == 'new') {
                s._isDetailView = true;
            }
            else {
                s._isDetailView = false;
            }
            s.$emit('basic-crud-loaded');

        }
    };
    $rootScope._basicCrud = self;
    return self;

}]);
