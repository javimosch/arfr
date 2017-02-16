/*global angular*/
/*global _*/
var app = angular.module('service-app-session', []).service('appSession', ['$rootScope', '$log', '$timeout', 'appApi', 'appUtils', 'i18n', 'appSettings', function(r, $log, $timeout, appApi, appUtils, i18n, appSettings) {

    const CONSTANT = {
        USER_COLLECTION: 'muser',
        METADATA_KEY: 'metadata',
        CACHE_KEY: 'cache',
        SESSION_KEY: 'user'
    };

    var sessionId = appSettings.appName + '_' + window.location.hostname;


    var self = function(data) {
        return self.saveCustom(CONSTANT.SESSION_KEY, data);
    };
    self.saveCache = function(newData, data) {
        if (typeof newData == 'string' && data != undefined) {
            var key = newData;
            newData = {};
            newData[key] = data;
        }
        return self.saveCustom(CONSTANT.CACHE_KEY, newData);
    };
    self.logout = function() {
        self.saveCustom(CONSTANT.SESSION_KEY, {
            email: null,
            password: null
        });
        appUtils.url.clear();
        r.$emit('app-logout');
    };
    self.getCache = function() {
        return self.getCustom(CONSTANT.CACHE_KEY);
    };
    self.onLogout = function(handler) {
        return r.$on('app-logout', handler);
    };
    self.saveCustom = function(label, newData) {
        if (newData) {
            var _existing_data = appUtils.store.get(sessionId + '_' + label.toLowerCase()) || {};
            for (var x in newData) {
                _existing_data[x] = newData[x];
            }
            appUtils.store.set(sessionId + '_' + label.toLowerCase(), _existing_data);
        }
        return appUtils.store.get(sessionId + '_' + label.toLowerCase()) || {};
    };
    self.getCustom = function(label) {
        return appUtils.store.get(sessionId + '_' + label.toLowerCase());
    };
    self.saveMetadata = function(newData) {
        return self.saveCustom(CONSTANT.METADATA_KEY, newData);
    };
    self.getMetadata = function() {
        return self.getCustom(CONSTANT.METADATA_KEY);
    }
    self.isLogged = function() {
        var _session = self();
        return _session._id !== null && _session.email !== null && _session.password !== null;
    };

    self.hasRole = function(role) {
        if (!self().roles) return false;
        return self().roles.includes(role);
    };

    if (self() && self()._id) {
        appApi.getById(CONSTANT.USER_COLLECTION, self()._id).then(self);
    }

    window._appSession = self;
    return self;
}]);
