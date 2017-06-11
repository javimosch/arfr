"use strict"
var User = require('../model/mongorito-schemas').MUser;
var db = require('../model/backend-database');
const controllers = require('../model/backend-controllers-manager');

//db.Mongorito.connect(db.dbURI);

module.exports = {
    signUp: signUp,
    signIn: signIn,
    saveProfile: saveProfile
}

function saveProfile(data, cb) {
    if (!data.email) return cb('Email required');
    if (!data.password) return cb('Password required');
    var editables = ['first_name', 'last_name', 'roles'];
    db.co(function*() {
        var count = yield User.count({
            email: data.email,
            password: data.password
        });
        if (count >= 1) {
            var item = yield User.findOne({
                _id: data._id
            });
            for (var x in editables) {
                if (data[editables[x]] != undefined) {
                    item.set(editables[x], data[editables[x]]);
                }
            }
            yield item.save();
            return cb(null, item.get());
        }
        else {
            return cb('Account not found');
        }
    }).catch(cb);
}

function signUp(data, cb) {
    if (!data.email) return cb('Email required');
    if (!data.password) return cb('Password required');

    return controllers.muser.model.count({
        email: data.email
    }, (err, count) => {
        if (err) return cb(err);
        if (!count || count < 1) {
            controllers.muser.save(data, cb);
        }
        else {

            return controllers.muser.get({
                email: data.email
            }, (err, _user) => {
                if (err) return cb(err);

                return cb({
                    code: 'VALIDATE_EMAIL_IN_USE',
                    message: 'There is already an account linked to ' + data.email,
                    count: count,
                    user: _user
                });
            });


        }

    });

    db.co(function*() {

        var count = yield User.count({
            email: data.email
        });
        if (count >= 1) {
            return cb({
                code: 'VALIDATE_EMAIL_IN_USE',
                message: 'There is already an account linked to ' + data.email,
                count: count
            });
        }


        var item = new User(data);
        yield item.save();
        return cb(null, item);
    }).catch(cb);
}

function signIn(data, cb) {
    if (!data.email) return cb('Email required');
    if (!data.password) return cb('Password required');
    db.co(function*() {
        var item = yield User.findOne({
            email: data.email,
            password: data.password
        });
        return cb(null, item);
    }).catch(cb);
}
