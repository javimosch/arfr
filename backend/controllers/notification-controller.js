var Notification = require('../model/backend-mongoose-wrapper').create('Notification');
var UserNotifications = require('../model/backend-mongoose-wrapper').create('UserNotifications');
var User = require('../model/backend-mongoose-wrapper').create('User');
var Order = require('../model/backend-mongoose-wrapper').create('Order');

const controllers = require('../model/backend-controllers-manager');




//var EmailHandler = null; // require('../helpers/handlers.email').actions;
var moment = require('moment');
var S = require('string');
var btoa = require('btoa')
var _ = require('lodash');
var modelName = 'notification';
var actions = {
    log: (m) => {
        console.log(modelName.toUpperCase() + ': ' + m);
    }
};

var MODULE = 'Notification';

var Logger = controllers.logs.createLogger({
    name: "API",
    category: "NOTIFICATION"
});

//r._appApi.ctrl('Notification','M_USER_NEW_ACCOUNT',{_user:_appSession()});

var NOTIFICATION = {

    BA_ADMIN_CONTACT_FORM: 'BA_ADMIN_CONTACT_FORM',
    M_USER_NEW_ACCOUNT: 'M_USER_NEW_ACCOUNT',

    ADMIN_BOOKING_MISSING_DEPARTMENT: 'ADMIN_BOOKING_MISSING_DEPARTMENT',
    ADMIN_BOOKING_MISSING_DEPARTMENT_REQUEST: 'ADMIN_BOOKING_MISSING_DEPARTMENT_REQUEST',

    ADMIN_ADMIN_ACCOUNT_CREATED: 'ADMIN_ADMIN_ACCOUNT_CREATED',
    ADMIN_CLIENT_ACCOUNT_CREATED: 'ADMIN_CLIENT_ACCOUNT_CREATED',
    ADMIN_DIAG_ACCOUNT_CREATED: 'ADMIN_DIAG_ACCOUNT_CREATED',
    ADMIN_DIPLOME_EXPIRATION: 'ADMIN_DIPLOME_EXPIRATION',
    ADMIN_NEW_CONTACT_FORM_MESSAGE: 'ADMIN_NEW_CONTACT_FORM_MESSAGE', //notif_newContactFormMessage,
    ADMIN_ORDER_PAYMENT_DELEGATED: 'ADMIN_ORDER_PAYMENT_DELEGATED',
    ADMIN_ORDER_PAYMENT_SUCCESS: 'ADMIN_ORDER_PAYMENT_SUCCESS',
    ADMIN_ORDER_PAYMENT_PREPAID_SUCCESS: 'ADMIN_ORDER_PAYMENT_PREPAID_SUCCESS',

    CLIENT_CLIENT_NEW_ACCOUNT: 'CLIENT_CLIENT_NEW_ACCOUNT',
    CLIENT_ORDER_CREATED: 'CLIENT_ORDER_CREATED',
    CLIENT_ORDER_PAYMENT_SUCCESS: 'CLIENT_ORDER_PAYMENT_SUCCESS',
    CLIENT_ORDER_DELEGATED: 'CLIENT_ORDER_DELEGATED',

    DIAG_DIAG_ACCOUNT_CREATED: 'DIAG_DIAG_ACCOUNT_CREATED',
    DIAG_NEW_RDV: 'DIAG_NEW_RDV',
    DIAG_RDV_CONFIRMED: 'DIAG_RDV_CONFIRMED',

    LANDLORD_ORDER_PAYMENT_DELEGATED: 'LANDLORD_ORDER_PAYMENT_DELEGATED',
    LANDLORD_ORDER_PAYMENT_SUCCESS: 'LANDLORD_ORDER_PAYMENT_SUCCESS',

    USER_PASSWORD_RESET: 'USER_PASSWORD_RESET',
    M_SUBSCRIBE: 'M_SUBSCRIBE'
};

var _actions = {
    trigger: trigger,
    save: save,
    NOTIFICATION: NOTIFICATION,
    //init: (_EmailHandler) => EmailHandler = _EmailHandler
};
Object.keys(NOTIFICATION).forEach(KEY => {
    _actions[KEY] = (data, cb) => trigger(KEY, data, cb);
});

module.exports = _actions;

function LogSave(msg, type, data) {
    controllers.logs.save({
        message: msg,
        type: type || 'error',
        data: data
    });
}

function trigger(name, data, cb) {
    //try {
    //actions.log('trigger=' + JSON.stringify(data));
    actions.log('trigger ', name, data, cb);
    if (!name) return cb && cb("name required");
    if (!NOTIFICATION[name]) {
        LogSave('Notification trigger name not found: ' + name, 'error', data);
        return cb && cb("trigger notification not found: " + name);
    }
    //actions.log('trigger:routing-' + name + '=' + JSON.stringify(data));
    data.__notificationType = name;

    //Logger.debug(Object.keys(CTRL));

    return controllers.email[name](data, cb);
    //} catch (err) {
    //    LogSave("Notification triggering error", 'error', err);
    //    return cb && cb(err);
    // }
}



function save(data, cb) {
    var _user = data._user;
    var _userID = _user && _user._id || _user;

    if (typeof _user === 'object' && !_user._id) {
        return console.log(MODULE, "save", 'data._user needs to have an _id property.', {
            type: data.type,
            subject: data.subject,
            to: data.to
        });
    }

    if (!_userID) {
        LogSave('notification-save user-not-found', 'error', data);
        if (cb) cb("notification-save user-not-found");
        return;
    }


    controllers.notification.create({
        _user: _userID,
        type: data.type || 'no-type',
        to: data.to || 'not-specified',
        subject: data.subject || 'not specified',
        contents: data.html || '',
    }, (err, _notification) => {
        if (err) return LogSave('saveNotification fail when creating a notification for user ' + _user.email + ' : ' + JSON.stringify(err));
        if (cb) cb(_notification);

        // _config.notifications.push(_notification);
        // _config.save();
    });
}


//console.log('NOTIFICATION = EXPORTS',JSON.stringify(Object.keys(module.exports)));
//console.log('NOTIFICATION.ACTIONS / NOTIFICATION / DEBUG = ',JSON.stringify(Object.keys(exports.NOTIFICATION)));
