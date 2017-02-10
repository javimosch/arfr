var controllers = require('../model/backend-controllers-manager');
var mongoose = require('../model/backend-database').mongoose;
var generatePassword = require("password-maker");
//var User = mongoose.model('User');
var promise = require('../model/utils').promise;
var validate = require('../model/validator').validate;
var handleMissingKeys = require('../model/validator').handleMissingKeys;
var actions = require('../model/backend-mongoose-wrapper').create('User');
var Log = require('../model/backend-mongoose-wrapper').create('Log');
var Order = require('../model/backend-mongoose-wrapper').create('Order');
var Balance = require('../model/backend-mongoose-wrapper').create('Balance');
var BalanceItem = require('../model/backend-mongoose-wrapper').create('BalanceItem');
//var email = require('./handlers.email').actions;
var _ = require('lodash');
var moment = require('moment');
var Notif = controllers.notification;

//User.methods.name = ()=>{return };

const MODULE = 'USER';
var logger = require('../model/logger')(MODULE);



function everyAdmin(cb) {
    controllers.diagsUser.getAll({
        userType: 'admin'
    }, (err, _admins) => {
        if (err) return cb(err);
        _admins.forEach((_admin) => {
            cb(null, _admin);
        });
    });
}

function departmentCoveredBy(data, cb) {
    actions.log('departmentCoveredBy=' + JSON.stringify(data));
    if (!data.department) return cb("department required");
    var User = controllers.diagsUser;
    User.getAll({
        __select: "departments",
        __rules: {
            disabled: {
                $ne: true
            } //exclude disabled diags
        }

    }, (err, _users) => {
        if (err) return cb(err);
        //actions.log('departmentCoveredBy=_users:len=' + JSON.stringify(_users.length));
        for (var x in _users) {
            //actions.log('departmentCoveredBy=looping='+x+'='+JSON.stringify(_users[x].departments||[]));
            if (_users[x].departments) {
                if (_.includes(_users[x].departments, data.department)) {
                    //  actions.log('departmentCoveredBy=check=' + JSON.stringify(_users[x].departments) + ' contra ' + data.department);
                    return cb(null, true);
                }
            }
        }
        return cb(null, false);
    });
}


function balance(data, cb) {
    data.period = data.period || 'year';
    actions.log('balance=' + JSON.stringify(data));
    data._calculate = data._calculate && data._calculate.toString() == 'true' || false;
    if (!data._id) return cb("_id required");
    if (data._calculate) {
        _calculate(null, null, true);
    } else {
        _retrieve();
    }

    //
    function _calculate(_err, _user, firstTime) {
        if (!_user && firstTime == true) return actions.model.findById(data._id, _calculate);
        if (!_user) return cb("balance:calculate=User not found:" + data._id);
        //
        if (_user.userType == 'admin') {
            return cb('Admin balance unsupported');
        }
        //
        actions.log('balance:_calculate');
        var balanceKeys = ['_user', 'amount'];
        var balanceMatch = ['_user'];
        var balanceItemKeys = ['_user', '_order', 'pending', 'amount', 'description'];
        var balanceItemMatch = ['_user', '_order'];
        //
        Balance.createUpdate({
            _user: _user._id,
            amount: 0
        }, (err, bal) => {
            if (err) return cb(err);
            actions.log('balance:_calculate:creteUpdate:rta', JSON.stringify(bal));
            BalanceItem.removeAll({
                _user: _user._id
            }, (err, rr) => {
                if (err) return cb(err);
                bal.items = [];
                _calculateBalance(null, bal);
            });
        }, balanceMatch, balanceKeys);
        //
        function _calculateBalance(err, _balance) {
            actions.log('balance:_calculateBalance', JSON.stringify(_balance));
            if (err) return cb(err, _balance);
            if (!_balance) return cb('balance:create:error');
            //
            //remove prev balance items

            //
            Order.getAll(_orderRules(), (err, _orders) => {
                actions.log('balance:_calculateBalance:orders=', _orders.length);
                if (err) return cb(err, _orders);

                if (!_orders || _orders.length == 0) {
                    _balance.amount = 0;
                    _balance.save((_err, r) => {
                        _retrieve();
                    });
                } else {
                    var balanceAmount = 0;
                    var _stackSaving = [];
                    var exit = false;
                    _orders.forEach(_order => {

                        //validate period
                        var now = moment();
                        if (!now.isSame(moment(_order.diagStart), data.period)) {
                            actions.log('balance:_calculateBalance:excluding order=' + _order._id);
                            return; // exclude  
                        }

                        _stackSaving.push(_order._id);
                        var d = {};
                        d.pending = !_.includes(['prepaid', 'completed'], _order.status);
                        d.description = _order.address + ' (' + moment(_order.diagStart).format('DD-MM-YY') + ', ' + moment(_order.diagStart).format('HH:mm') + ' - ' + moment(_order.diagEnd).format('HH:mm') + ')';
                        d.amount = _order.price;
                        //diag
                        //-_user.diagWebsiteComission (admin decide it) (-)
                        //-_order.fastDiagComm (+)
                        if (_user.userType == 'diag') {
                            var diagWebsiteComission = ((_order.price * _user.comission) / 100) * -1;

                            d.amount = _order.price + diagWebsiteComission;

                            var fastDiagComm = (d.amount * _order.fastDiagComm) / 100;
                            d.amount += fastDiagComm;
                        }
                        //admin
                        //-diag price (-)
                        //-client disccount (-)
                        //-stripe % (-)
                        if (_user.userType == 'admin') {
                            cb('Admin balance unsupported');
                            exit = true;
                            return false;
                        }
                        //client
                        //just the order price
                        d._order = _order._id;
                        d._user = _user._id;
                        //
                        balanceAmount += d.amount;
                        BalanceItem.createUpdate(d, (_err, _balanceItem) => {
                            _stackSaving = _stackSaving.slice(1);
                            //_balance.save(); //async
                            actions.log('balance:items:remain-for-saving', _stackSaving.length);
                        }, balanceItemMatch, balanceItemKeys).on('created', (_err, _balanceItem) => {
                            //_balance.items = _balance.items || [];
                            _balance.items.push(_balanceItem);
                            actions.log('balance:item:created **');
                        }).on('updated', (_err, _balanceItem) => {
                            actions.log('balance:item:updated **');
                        });

                    });
                    if (exit) return; //headers alredy sent;
                    _balance.amount = balanceAmount;
                    var waitChilds = setInterval(() => {
                        if (_stackSaving.length === 0) {
                            clearInterval(waitChilds);
                            _balance.save((_err, r) => {
                                _retrieve();
                            });
                        }
                    }, 50);
                }
            });
        }

        function _orderRules() {
            if (_user.userType == 'diag') return {
                _diag: _user._id
            };
            if (_user.userType == 'client') return {
                _client: _user._id
            };
            if (_user.userType == 'admin') return {};
        }
    }

    function _retrieve() {
        actions.log('balance:retrieve');
        Balance.get({
            _user: data._id,
            __populate: {
                'items': '_user _order pending amount description'
            }
        }, (err, _balance) => {
            return cb(err, _balance);
        });
    }
}


function _preCreateWallet(data, cb,next) {
    if (!data.wallet && (data.userType == 'client' || data.userType == 'diag')) {
        return controllers.lemonway.registerWallet({
            clientMail: data.email,
            clientFirstName: data.firstName,
            clientLastName: data.lastName,
            postCode: data.postCode,
            mobileNumber: data.cellPhone
        }, (err, res) => {
            if (!err && res && res.WALLET) {
                data.wallet = res.WALLET.ID;
                logger.info('LEMONWAY WALLET (automatic registration before saving user)', data.wallet);
            }
            if (err) {
                logger.error('LEMONWAY WALLET (automatic registration before saving user)', err);
                LogSave('LEMONWAY WALLET (automatic registration before saving user)', 'error', err);
            }
            return next(data, cb);
        });
    }
    return next(data, cb);
}

function save(data, cb) {
    if (!_.includes(['diag', 'client', 'admin'], data.userType)) {
        return cb("invalid userType " + data.userType);
    }

    _preCreateWallet(data, cb,__save);



    function __save(data, cb) {
        actions.createUpdate(data, cb, {
            email: data.email,
            userType: data.userType
        }, ['userType', 'email']).on('created', postCreate_notifications);
    }



    function postCreate_notifications(err, _user) {
        switch (_user.userType) {
            case 'admin':
                {
                    Notif.trigger(Notif.NOTIFICATION.ADMIN_ADMIN_ACCOUNT_CREATED, {
                        _user: _user
                    }, (_err, r) => handleNewAccount(_user, err, r));
                }
                break;
            case 'client':
                {
                    Notif.trigger(Notif.CLIENT_CLIENT_NEW_ACCOUNT, {
                        _user: _user
                    }, (_err, r) => handleNewAccount(_user, err, r));

                    everyAdmin((err, _admin) => {
                        if (err) return cb && cb(err) || LogSave(JSON.stringify(err), 'error', err);
                        Notif.trigger(Notif.ADMIN_CLIENT_ACCOUNT_CREATED, {
                            _user: _user,
                            _admin: _admin
                        }, (_err, r) => handleNewAccount(_user, err, r));
                    })

                }
                break;
        }
    }
}

function LogSave(msg, type, data) {
    Log.save({
        message: msg,
        type: type,
        data: data
    });
}

function handleNewAccount(_user, err, r) {
    if (err) return LogSave(err.message, 'error', err);
    if (r && r.ok) {
        actions.log(_user.email + ':passwordSended');
        _user.passwordSended = true;
        _user.save();
    } else {
        actions.log(_user.email + ' passwordSended email fail ' + JSON.stringify(r));
        LogSave(r.message, 'warning', r);
    }
}

function create(data, cb) {
    _preCreateWallet(data,cb, __create);

    function __create(data, cb) {
        actions.create(data, cb, ['email', 'userType', 'password']);
    }
}

function createUser(data, cb) {
    actions.log('createUser=' + JSON.stringify(data));
    data.password = data.password || generatePassword(8);
    data.userType = data.userType || 'admin';
    create(data, cb);
}

function createDiag(data, cb) {
    actions.log('createDiag=' + JSON.stringify(data));
    data.userType = 'diag';
    createUser(data, (err, _user) => {
        if (err) return cb(err, null);



        Notif.DIAG_NEW_ACCOUNT(_user, (err, r) => {
            //async (write log on error)
            if (r.ok) {
                actions.log(_user.email + ' new account email sended' + JSON.stringify(r));
                _user.passwordSended = true;
                _user.save((err, r) => {
                    if (!err) actions.log(_user.email + ' passwordSended=true');
                });
            } else {
                actions.log(_user.email + ' new account email sended failed');
                actions.log(JSON.stringify(err));
            }
        });
        return cb(err, _user);
    });
}

function createClient(data, cb) {
    actions.log('createClient=' + JSON.stringify(data));
    data.userType = 'client';
    data.clientType = data.clientType || 'landlord';
    createUser(data, (err, _user) => {
        if (err) return cb(err, null);
        sendAccountsDetails(_user);
        return cb(err, _user);
    });
}

function sendAccountsDetails(_user) {
    Notif.CLIENT_CLIENT_NEW_ACCOUNT({
        _user: _user
    }, (err, r) => {
        //async (write log on error)
        if (r.ok) {
            actions.log(_user.email + ' new account email sended' + JSON.stringify(r));
            _user.passwordSended = true;
            _user.save((err, r) => {
                if (!err) actions.log(_user.email + ' passwordSended=true');
            });
        } else {
            actions.log(_user.email + ' new account email sended failed');
            actions.log(JSON.stringify(err));
        }
    });
}

function createClientIfNew(data, cb) {
    actions.log('createClientIfNew=' + JSON.stringify(data));
    actions.check(data, ['email'], (err, r) => {
        if (err) return cb(err, null);
        actions.get({
            email: data.email
        }, (err, r) => {
            if (err) return cb(err, null);
            if (!r) {
                createClient(data, cb);
            } else {

                //in 10 seconds, try send account details if passwordSended==false
                setTimeout(function() {
                    if (!r.passwordSended) {
                        sendAccountsDetails(r);
                    }
                }, 10000);

                cb(null, r);
            }
        });
    });
}

function login(data, cb) {
    console.log('USER:login=' + JSON.stringify(data));
    actions.model.findOne(actions.toRules({
        email: data.email,
        password: data.password
    })).exec(cb);
}


function passwordReset(data, cb) {
    actions.check(data, ['email'], (err, r) => {
        if (err) return cb(err, r);
        actions.get({
            email: data.email
        }, (err, _user) => {
            if (err) return cb(err, _user);
            if (_user) {

                _user.password = generatePassword(8);
                _user.save();

                Notif.trigger('USER_PASSWORD_RESET', _user, (err, r) => {
                    return cb(err, r);
                })


            }
        })
    });
}

module.exports = {
    //custom
    departmentCoveredBy: departmentCoveredBy,
    balance: balance,
    save: save,
    createClientIfNew: createClientIfNew,
    createClient: createClient,
    login: login,
    createDiag: createDiag,
    passwordReset: passwordReset,
    //heredado
    existsById: actions.existsById,
    existsByField: actions.existsByField,
    createUpdate: actions.createUpdate,
    getAll: actions.getAll,
    remove: actions.remove,
    result: actions.result,
    get: actions.get,
    check: actions.check,
    removeAll: actions.removeAll,
    toRules: actions.toRules,
    find: actions.find,
    create: create,
    log: actions.log,
    _configure: (hook) => {
        hook('preSave', preSave);
    }
};


function preSave(data) {

    //ADMIN#1 OK ctrl.user
    if (data.notifications && data.userType == 'admin' && !data.notifications.ADMIN_ADMIN_ACCOUNT_CREATED) {
        Notif.trigger(Notif.NOTIFICATION.ADMIN_ADMIN_ACCOUNT_CREATED, {
            _user: data
        });
    }

    //ADMIN//#2 OK ctrl.user
    if (data.notifications && data.userType == 'client' && !data.notifications.ADMIN_CLIENT_ACCOUNT_CREATED) {
        everyAdmin((err, _admin) => {
            if (err) return LogSave(JSON.stringify(err), 'error', err);
            Notif.trigger(Notif.NOTIFICATION.ADMIN_CLIENT_ACCOUNT_CREATED, {
                _user: _.cloneDeep(data),
                _admin: _admin
            });
        });
        data.notifications.ADMIN_CLIENT_ACCOUNT_CREATED = true;
    }


    //DIAG//#1 OK ctrl.user app.diag.complete
    if (data.notifications && data.userType == 'diag' && data.disabled == false && !data.notifications.DIAG_DIAG_ACCOUNT_CREATED) {
        Notif.trigger(Notif.NOTIFICATION.DIAG_DIAG_ACCOUNT_CREATED, {
            _user: data
        });
    }

    //ADMIN//#3 OK ctrl.user
    if (data.notifications && data.userType == 'diag' && data.disabled == true && !data.notifications.ADMIN_DIAG_ACCOUNT_CREATED) {
        everyAdmin((err, _admin) => {
            if (err) return LogSave(JSON.stringify(err), 'error', err);

            console.log(JSON.stringify(_admin));

            Notif.trigger(Notif.NOTIFICATION.ADMIN_DIAG_ACCOUNT_CREATED, {
                _user: _.cloneDeep(data),
                _admin: _admin
            });
        });
    }

    return data;
}
