/*global angular*/
/*global _*/
/*global moment*/
/*global $U*/
angular.module('run-api-meetful-user', []).run(['$rootScope', '$log', 'appUtils', 'appSettings', 'fileUpload', 'i18n', 'appApi', function($rootScope, $log, appUtils, appSettings, fileUpload, i18n, appApi) {
    const CONTROLLER_NAME = 'meetfulUser';
    const COLLECTION_NAME = 'muser';
    const CUSTOM_ACTIONS = {
        addMessage: addMessage
    };

    function addMessage(data,resolve, reject, emit) {
        resolve('SUCCESS!');
    }


    appApi.addController(CONTROLLER_NAME, COLLECTION_NAME, CUSTOM_ACTIONS);
}]);
