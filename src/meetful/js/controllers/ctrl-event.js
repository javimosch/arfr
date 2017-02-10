/*global angular*/
/*global moment*/
angular.module('ctrl-event', []).controller('ctrl-event', ['$scope', '$rootScope', 'appApi', 'appGui', '$log', 'appSession', 'appRouter', '$routeParams', 'i18n', 'appUtils', '$timeout', function(s, r, appApi, appGui, $log, appSession, appRouter, $routeParams, i18n, appUtils, $timeout) {
    window.s = s;

    const MESSAGE = {
        TAG_REQUIRED: 'At least three tags',
        ADDRESS_REQUIRED: 'Complete address'
    };

    if (!appSession().first_name) {
        appGui.infoMessage(i18n.TEXT_COMPLETE_PROFILE);
    }

    if (appRouter.params().userIsTryingToCreateAnEvent) {
        appRouter.params({
            userIsTryingToCreateAnEvent: false
        });
    }


    s.isOwner = () => {
        //return s.
    };

    s.date = {
        min: moment()
    };

    s.address = {
        options: {
            //            types: ['(cities)'],
            componentRestrictions: {
                country: 'ES'
            }
        },
        full_address: '',
        streetNumber: '',
        street: '',
        city: '',
        state: '',
        country: '',
        postCode: '',
    };

    s.data = {};
    s.save = function() {

        if (!s.data.address) return appGui.warningMessage(MESSAGE.ADDRESS_REQUIRED);

        s.data.city = s.address.city;

        if (!s.tags) return appGui.warningMessage(MESSAGE.TAG_REQUIRED)
        var tags = (typeof s.tags == 'string') ? s.tags.split(',') : s.tags;
        if (!tags) return appGui.warningMessage('Tags parse error. Take a look at your tags.');
        if (tags && tags.length < 3) {
            return appGui.warningMessage(MESSAGE.TAG_REQUIRED);
        }
        for (var x in tags) {
            tags[x] = tags[x].trimLeft();
            tags[x] = tags[x].trimRight();
            tags[x] = appUtils.replaceAll(tags[x], '#', '');
            tags[x] = appUtils.replaceAll(tags[x], ' ', '-');
            tags[x] = appUtils.replaceAll(tags[x], '\n', '-');
            tags[x] = appUtils.replaceAll(tags[x], '\r', '-');

            tags[x] = tags[x].toLowerCase();
            tags[x] = '#' + tags[x];
        }
        s.data.tags = s.tags = tags;

        var hasAnId = s.data._id;

        if (!s.data._owner) {
            s.data._owner = appSession()._id;
            //return appGui.warningMessage('Owner required.');
        }

        appApi.saveEvent(s.data).then(function(result) {
            appGui.infoMessage('Saved');

            $log.debug(result);

            appRouter.params({
                userHadCreateAnEvent: !hasAnId,
                userHadEditAnEvent: hasAnId != undefined
            });

        }).error(function(res) {
            appGui.errorMessage();
        }).on('validate', function(msg) {
            appGui.warningMessage(msg);
        });
    };

    s.close = function() {
        appApi.closeEvent(s.data).then(function(result) {
            appGui.warningMessage('Closed');
            s.data.status = 'closed';
        }).error(function(res) {
            appGui.errorMessage();
        }).on('validate', function(msg) {
            appGui.warningMessage(msg);
        });
    };

    s.open = function() {
        appApi.openEvent(s.data).then(function(result) {
            appGui.warningMessage('Open!');
            s.data.status = 'open';
        }).error(function(res) {
            appGui.errorMessage();
        }).on('validate', function(msg) {
            appGui.warningMessage(msg);
        });
    };



    s.join = function() {

        if (s.currentUserIsJoined()) {
            return appGui.warningMessage('Already joined');
        }


        s.data._users = s.data._users || [];
        //s.data._users.push();

        //meetfulEventUser
        var item = {
            _user: appSession()._id,
            _event: s.data._id,
            enabled: false,
            message: "I want to join!",
            __match: {
                _user: appSession()._id,
                _event: s.data._id
            }
        };

        appApi.meetfulEvent.updateOrPushArrayElement({
            _id: s.data._id,
            __cast: {
                model: 'meetfulEventUser',
                arrayName: "_users",
                item: item
            }
        }).then(res => {
            $log.debug(res);
        });
    };

    s.chatMessage = '';
    s.addMessage = function() {
        
        if(!s.chatMessage) return appGui.warningMessage('Enter a message');
        
        appApi.meetfulEvent.addMessage({
            _event: s.data._id,
            message: s.chatMessage
        }).then(message => {
            s.data._messages.push(message);

            generateMessages();

        });
    };

    function getChatUserLabel(_user) {
        if (!_user._id) {
            _user = s.data._users.filter(v => v._user._id == _user)[0]._user;
        }
        return _user.first_name || _user.email;
    }

    s._messages = [];
    $timeout(generateMessages, 1000);

    function generateMessages() {
        if (!s.data || !s.data._messages) return '';
        s._messages = s.data._messages.map(m => {
            return {
                user: getChatUserLabel(m._user),
                message: m.message,
                created_at: r.momentDateTime(m.created_at)
            };
        });
    };
    s.getMessages = () => {
        return s._messages;
    };


    s.currentUserIsJoined = () => {
        return s.data && s.data._users && s.data._users.filter(u =>
            u._user._id == appSession()._id
        ).length > 0;
    };

    s.ownerLabel = () => {
        return s.data && s.data._owner && ((s.data._owner.first_name + (' ' + s.data._owner.last_name || '')) || s.data._owner.email);
    };

    s.isOwner = () => {
        if (!s.data || !s.data._owner || !s.data._owner._id) return false;
        return appSession()._id == s.data._owner._id;
    };
    s.showSave = () => {
        return s.isOwner();
    };
    s.showClose = () => {
        return s.isOwner() && s.data._id && s.data.status != 'closed';
    };
    s.showOpen = () => {
        return s.isOwner() && s.data._id && s.data.status != 'open';
    };
    s.showJoin = () => {
        return !s.isOwner() && !s.currentUserIsJoined();
    };

    s.statusLabel = () => {
        if (!s.data) return '';
        switch (s.data.status) {
            case "open":
                return i18n.TEXT_OPEN;
            case "closed":
                return i18n.TEXT_CLOSED;
            default:
                return "";
        }
    };

    function get_id() {
        var params = appRouter.params();
        if (params.item && params.item._id) {
            return params.item._id;
        }
        else {
            return $routeParams && $routeParams.id;
        }
    }

    var _id = get_id();

    if (_id) {
        /*
        {
                _owner: "first_name email",
                _users:"_user enabled",
                "_users._user":"email"
            }*/

        appApi.getEvent(_id, {
            __populate: [{
                model: "muser",
                path: '_owner'
            }, {
                model: 'meetfulEventUser',
                path: "_users",
                populate: {
                    model: 'muser',
                    path: "_user"
                }
            }, {
                model: "meetfulEventMessages",
                path: "_messages"//,
                //populate: {
                //  model: "muser",
                //path: "_user",
                //select: "email"
                //}
            }]
        }).then(function(result) {
            s.data = result;

            s.tags = s.data.tags;
            for (var x in s.tags) {
                if (x == 0) continue;
                s.tags[x] = ' ' + s.tags[x];
            }


            appRouter.clearItem();
        });
    }

}]);
