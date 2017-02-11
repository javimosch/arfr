/*global angular*/
/*global _*/
/*global moment*/
/*global $U*/
angular.module('run-api-meetful-event', []).run(['$rootScope', '$log', 'appUtils', 'appSettings', 'fileUpload', 'i18n', 'appApi', 'appSession', function($rootScope, $log, appUtils, appSettings, fileUpload, i18n, appApi, appSession) {
    const CONTROLLER_NAME = 'meetfulEvent';
    const COLLECTION_NAME = 'mevent';
    const CUSTOM_ACTIONS = {
        addMessage: addMessage,
        fetchEventsFromUser: fetchEventsFromUser,
        fetchEventsWhereUserIsJoined: fetchEventsWhereUserIsJoined
    };

    function addMessage(data, resolve, reject, emit) {
        //data._user data._event data._message
        data._user = appSession()._id;
        appApi.meetfulEventMessages.save(data).then((message) => {

            appApi.meetfulEvent.update({
                _id: message._event,
                __rules: {
                    $push: {
                        _messages: message
                    }
                }
            }).then(affectedRows => {
                $log.debug('addMessage', affectedRows);
                resolve(message);
            });

        });
    }

    function fetchEventsFromUser(data, resolve, reject, emit) {
        return appApi.meetfulEvent.getAll({
            _owner: appSession()._id
        }).then(resolve).error(reject).on('validate', (msg) => {
            emit('validate', msg)
        });
    }

    function fetchEventsWhereUserIsJoined(data, resolve, reject, emit) {
        return appApi.meetfulEvent.getAll({
            __populate: [{
                model: "meetfulEventUser",
                path: "_users",
                match:{
                    '_user': appSession()._id
                }
            }],
            __rules: {
                
            }
        }).then(resolve).error(reject).on('validate', (msg) => {
            emit('validate', msg)
        });
    }


    appApi.addController(CONTROLLER_NAME, COLLECTION_NAME, CUSTOM_ACTIONS);
    appApi.addController('meetfulEventMessages', 'meetfulEventMessages');
}]);
