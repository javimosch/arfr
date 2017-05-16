var name = 'task:diplomeExpirationCheck';
var _ = require('lodash');
var moment = require('moment');
var User = require('../backend-mongoose-wrapper').create('User');
var Order = require('../backend-mongoose-wrapper').create('Order');
var Log = require('../backend-mongoose-wrapper').create('Log');
var Email = require('../../controllers/ctrl.email');
var Notif = require('../../controllers/ctrl.notification');
var NOTIFICATION = Notif.NOTIFICATION;
var log = (m) => {
    console.log(name + ': ' + m);
    return name + ': ' + m;
}
var dblog = (msg, type) => Log.save({
    message: msg,
    type: type
});

function handler(data, cb) {
   // log('retrieve diags in progress');
    User.getAll({
        userType: 'diag'
    }, (err, r) => {
        if (err) return dblog(log('Fail to retreive diags.'));
       // log('retrieve diags ok');
        var filename, info;
        r.forEach(diag => {
            if (_.isUndefined(diag.diplomesInfo)) {
              //  log(diag.email + ' diplomesInfo undefined.');
            }
            else {
                //expirationDateNotificationEnabled
                //expirationDateNotificationSended
                //filename
                //expirationDate
                //obtentionDate
                Object.keys(diag.diplomesInfo).forEach((id) => {
                    info = diag.diplomesInfo[id];
                    filename = info.filename || 'unkown-file-name (' + id + ' = ' + JSON.stringify(info) + ')';
                    //
                    if (_.isUndefined(info.expirationDateNotificationEnabled)) {
                        //log(diag.email + ' ' + filename + ' expirationDateNotificationEnabled field required.');
                    }
                    else {
                        if (_.isUndefined(info.expirationDate)) {
                           // log(diag.email + ' ' + filename + ' expirationDate field required.');
                        }
                        else {
                            if (moment().diff(moment(info.expirationDate), 'days') < 31) {
                                if (!_.isUndefined(info.expirationDateNotificationSended) && info.expirationDateNotificationSended === true) {
                                   // log(diag.email + ' ' + filename + ' has expire and alert was already sended.');
                                }
                                else {
                                    User.getAll({
                                        userType: 'admin'
                                    }, (err, admins) => {
                                        if (err) {
                                            return dblog(log('Fai lto retrieve admins.'));
                                        }
                                        else {
                                            admins.forEach(_admin => {
                                                sendEmail(_admin, diag, info, id);
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    }
                });
            }
        });
    });
}

function sendEmail(_admin, _diag, _info, _diplomeId) {

    Notif.trigger(NOTIFICATION.ADMIN_DIPLOME_EXPIRATION, {
        _admin: _admin,
        _diag: _diag,
        _info: _info,
        filename: _info.filename,

    }, (_err, r) => {
        if (_err) return dblog(log('Fail when sending alert email to ' + _admin.email));
        //backend-databaselog(log('Email sended to ' + _admin.email), 'success');
        //
        _info.expirationDateNotificationSended = true;
        _diag.diplomesInfo[_diplomeId] = _info;
        //
        User.update(_diag, (_err, r) => {
            if (_err) return dblog(log('Fail when updating expirationDateNotificationSended on ' + _diag.email));
        });
    })

}

module.exports = {
    name: name,
    interval: 1000 * 60 * 60, //each hour
    handler: handler,
    startupInterval: false,
    startupIntervalDelay:20000
};
