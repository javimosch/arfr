var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var moment = require('moment');
var S = require('string');
var btoa = require('btoa')
var _ = require('lodash');
var modelName = 'text';

var logger = resolver.logger().get("CONTROLLER", "AUTH");



module.exports = {
    login: login,
    createAccount: createAccount,
    generatePassword: generatePassword,
    refreshToken:refreshToken
};

var encodePassword = (pwd) => resolver.getFacade('cipher').encodePassword(pwd);
var decodePassword = (pwd) => resolver.getFacade('cipher').decodePassword(pwd);
var encodeObject = (d) => resolver.getFacade('cipher').encodeObject(d);
var decodeObject = (s) => resolver.getFacade('cipher').decodeObject(s);



function handleEmailRequired() {
    return {
        code: 140,
        msg: "Email required"
    };
}

function handleInvalidEmail(email) {
    return {
        code: 145,
        msg: "There is no account registered with " + email
    };
}

function refreshToken(data) {
    return resolver.coWrapExec(function*() {

        var userId;

        if (data.userId) {
            userId = data.userId;
        }
        else {
            if (!data.token) {
                return resolver.Promise.reject({
                    //code: 150,
                    msg: "Token required!"
                });
            }
            else {
                logger.debugTerminal('Decoding token / ', data.token);
                var tokenObject = decodeObject(data.token);
                logger.debugTerminal('Decoding token / done ', tokenObject);
                userId = tokenObject.user_id;
            }
        }

        logger.debugTerminal('Generating token');
        var expireAt = Date.now() + 1000 * 60 * 60 * 2;
        var token = encodeObject({
            expireAt: expireAt,
            user_id: userId,
        });
        logger.debugTerminal('Generating token / done', token);
        var sessionData = {
            _user: userId,
            token: token,
            expireAt: expireAt
        };
        logger.debugTerminal('Generating session / finding');
        var sessionDoc = yield resolver.model().sessions.findOneAndUpdate({
            _user: userId,
        });

        if (!sessionDoc) {
            logger.debugTerminal('Generating session / creating');
            yield resolver.model().sessions.create(sessionData);
        }
        else {
            logger.debugTerminal('Generating session / updating');
            yield sessionDoc.update(sessionData);
        }
        return resolver.Promise.resolve({
            token: token
        });
    });
}

function generatePassword(data) {
    return resolver.coWrapExec(function*() {
        if (!data.email) return resolver.Promise.reject(handleEmailRequired());
        var doc = yield resolver.model().users.findOne({
            email: data.email,
        }).exec();
        var newPwd = 'secret';
        if (doc) {
            doc.pwd = encodePassword(newPwd);
            yield doc.save();
            return resolver.Promise.resolve({
                pwd: newPwd,
                message: "Your new password is: " + newPwd
            });
        }
        else {
            return resolver.Promise.reject(handleInvalidEmail(data.email));
        }
    });
}

function createAccount(data) {
    return resolver.coWrapExec(function*() {
        if (!data.email) return resolver.Promise.reject({
            code: 140,
            msg: "Email required"
        });
        if (!data.pwd) return resolver.Promise.reject({
            code: 140,
            msg: "Password required"
        });
        var doc = yield resolver.model().users.create({
            email: data.email,
            pwd: encodePassword(data.pwd),
            role: data.role
        });
        return resolver.Promise.resolve(doc);
    });
}

//Normal login with email / pwd
function login(data) {
    return resolver.coWrapExec(function*() {

        if (!data.email) return resolver.Promise.reject({
            code: 140,
            msg: "Email required"
        });

        if (!data.pwd) return resolver.Promise.reject({
            code: 140,
            msg: "Password required"
        });

        var doc = yield resolver.model().users.findOne({
            email: data.email
        }).exec();

        if (!doc) {
            return resolver.Promise.reject(handleInvalidEmail(data.email));
        }
        else {
            logger.debugTerminal('Login with', data.email, data.pwd, decodePassword(doc.pwd));
            if (data.pwd != decodePassword(doc.pwd)) {
                return resolver.Promise.reject({
                    code: 146,
                    msg: "Invalid credentials"
                });
            }
        }


        var obj = yield refreshToken({
            userId: doc._id
        });


        return resolver.Promise.resolve({
            _token: obj.token,
            account: {
                email: doc.email,
                firstName: doc.firstName,
                lastName: doc.lastName,
                role: doc.role
            }
        });
    });
}
