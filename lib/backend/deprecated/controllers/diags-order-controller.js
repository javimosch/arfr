var mongoose = require('../model/backend-database').mongoose;
var atob = require('atob'); //decode
var btoa = require('btoa'); //encode
var moment = require('moment');
var promise = require('../model/utils').promise;
var _ = require('lodash');
var generatePassword = require("password-maker");
var validate = require('../model/validator').validate;
var handleMissingKeys = require('../model/validator').handleMissingKeys;
//var ClientActions = require('./handlers.client').actions;
var controllers = require('../model/backend-controllers-manager');
//var Order = mongoose.model('Order');
var Log = controllers.log;
var User = controllers.diagsUser;
var actions = require('../model/backend-mongoose-wrapper').create('diagsOrder');
var UserAction = controllers.diagsUser;
var utils = require('../model/utils');
//var payment = ctrl('payment');
//var stripe = payment.stripe;
var email = controllers.email;
var notification = controllers.notification;


const MODULE = 'ORDER';
var logger = require('../model/logger')(MODULE);

var saveKeys = ['_client', '_diag', 'start', 'end', 'diags'

    , 'address', 'price' //, 'time'
];


function LogSave(msg, type, data) {
    try{
    Log.save({
        message: msg,
        type: type || 'error',
        data: data || {}
    });
    }catch(err){
        logger.error(MODULE," LOG-SAVE ",err);
    }
}

function decodePayload(secret) {
    //encoding / decoding of data.secret:
    //var a = btoa(JSON.stringify({a:1})) + btoa('secret')   <--- encoding
    //var b = JSON.parse(atob(a.substring(0,a.indexOf(btoa('secret'))))) <--- decoding
    return JSON.parse(atob(secret.substring(0, secret.indexOf(btoa('secret')))));
}

function getNextInvoiceNumber(data, cb) {
    function zeroFill(number, width) {
        width -= number.toString().length;
        if (width > 0) {
            return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
        }
        return number + ""; // always return a string
    }
    //data._id //order id
    if (!data._id) return cb('_id required');
    controllers.diagsOrder.get({
        _id: data._id,
        __select: 'start _diag'
    }, function(err, _order) {
        if (err) return cb(err);
        if (!_order) {
            return cb('Order not found.');
        }
        controllers.diagsOrder.model.count({
            status: {
                $eq: 'prepaid'
            },
            _diag: {
                $eq: _order._diag
            },
            start: {
                $gte: moment(_order.start).startOf('month')._d,
                $lte: moment(_order.start).endOf('month')._d
            }
        }, function(err, count) {
            if (err) return cb(err);
            var numberAsString = moment(_order.start).format('YYMM').toString() + zeroFill(count + 1, 3).toString();
            cb(null, numberAsString);
        });

    });
}

function moveToPrepaid(data, cb) {
    //Update order status.
    var payload = {
        _id: data._id,
        status: 'prepaid',
        walletTransId: data.walletTransId,
        paidAt: Date.now(),
        number: data.number
    };
    save(payload, function(err, order) {

        if (err) {
            logger.error(MODULE, ' MOVE-TO-PREPAID ERROR ', err);
            LogSave('Order moving to prepaid error', 'error', err);
            return cb(err);
        }
        else {
            LogSave('Order moved to prepaid', 'info', payload);
            logger.info(MODULE, ' MOVE-TO-PREPAID SUCESS ', payload);
            return cb(null, payload);
        }


    }, ['_id', 'status', 'walletTransId', 'paidAt', 'number']);


}

var processing_order_payment = {};

function payUsingLW(data, callback) {
    if (!data.orderId) return callback('orderId field required');
    
    if (!data.__allowPayment && processing_order_payment[data.orderId]) return callback('Order payment is already being processed.');
    processing_order_payment[data.orderId] = true;
    var cb = function(err, res) {
        processing_order_payment[data.orderId] = false;
        return callback(err, res);
    };

    if (!data.__allowPayment) {
        controllers.diagsOrder.get({
            _id: data.orderId,
            __select: "status"
        }, function(err, _order) {
            if (err) return cb(err);
            if (_order.status === 'created') {
                data.__allowPayment = true;
                return payUsingLW(data, cb);
            }
            else {
                return cb('Order already paid.');
            }
        });
        return;
    }

    


    if (!data.secret) return cb('secret field required');
    if (!data.p2pDiag) return cb('p2pDiag field required');
    var decodedPayload = decodePayload(data.secret);


    getNextInvoiceNumber({
        _id: data.orderId
    }, function(err, invoiceNumber) {
        if (err) return cb(err);
        decodedPayload.comment = decodedPayload.comment.replace('_INVOICE_NUMBER_', invoiceNumber);

        logger.info(MODULE, ' PAY-WITH-LW INVOICE-NMBER ', invoiceNumber);

        //step 1 payment with card
        controllers.lemonway.moneyInWithCardId(decodedPayload, function(err, LWRES) {
            if (err) return cb(err);

            logger.info(MODULE, ' PAY-WITH-LW MONEY-IN-RESULT ', LWRES);

            if (LWRES && LWRES.TRANS && LWRES.TRANS.HPAY && LWRES.TRANS.HPAY.STATUS == '3') {}
            else {
                logger.error(MODULE, ' PAY-WITH-LW INVALID-RESPONSE ', LWRES);
                LogSave('Invalid response from Lemonway (moneyInWithCardId)', 'error', LWRES);
                return cb({
                    message: "Invalid response from Lemonway. Check the logs."
                });
            }

            logger.info(MODULE, ' MOVE-TO-PREPAID #', invoiceNumber);


            //step 2, moving the order to prepaid

            moveToPrepaid({
                _id: data.orderId,
                walletTransId: LWRES.TRANS.HPAY.ID,
                number: invoiceNumber
            }, function(err, res) {
                console.log('MOVE-TO-PREPAID RESULT', err, res);

                logger.info(MODULE, ' P2P LOOK-UP');
                //step 3  p2p to diag wallet 
                var p2pPayload = data.p2pDiag;
                p2pPayload.message = "Order #" + invoiceNumber;
                controllers.lemonway.sendPayment(p2pPayload, function(err, res) {
                    logger.info(MODULE, ' P2P-RESULT', err, res);
                    if (err) {
                        logger.error(MODULE, ' P2P after card transaction ', err);
                        LogSave('P2P after card transaction error', 'error', err);
                    }
                    else {
                        logger.info(MODULE, ' P2P after card transaction ', res);
                        LogSave('P2P after card transaction success', 'info', res);
                    }

                    logger.info(MODULE, ' PAY-USING-LW SUCCESS ');
                    return cb(err, true);
                });

            });





        });
    });
}

function confirm(data, cb) {
    actions.log('confirm=' + JSON.stringify(data));
    actions.getById(data, (err, _order) => {
        if (err) return cb(err, _order);
        if (_order.status == 'created') {
            _order.status = 'ordered';
            _order.save();
            User.getAll({
                userType: 'admin'
            }, (err, _admins) => {
                if (err) return cb(err, _admins);
                _admins.forEach(_admin => {

                    controllers.notification.ORDER_CONFIRMED_FOR_INVOICE_END_OF_THE_MONTH({
                        _user: _admin,
                        _order: _order
                    }, (_err, r) => {
                        if (r.ok) {
                            cb({
                                ok: true,
                                message: 'Order confirmed and admins notified by email.'
                            });
                        }
                    })
                });
            });
        }
        else {
            cb(null, {
                ok: true,
                message: 'Order already confirmed. (ordered)'
            });
        }
    });
}

function create(data, cb) {
    actions.create(data, cb, saveKeys);
}


function notifyClientOrderCreation(_order) {
    actions.log('async:notifyClientOrderCreation:start');
    if (_order && _order.info) {
        if (_order.info.clientNotified != true) {
            UserAction.get({
                _id: _order._client._id || _order._client
            }, (_err, _client) => {
                _client._orders.push(_order.id);

             

            });
        }
        else {
            actions.log('async:notifyClientOrderCreation:already-notified');
        }
    }
    else {
        actions.log('async:notifyClientOrderCreation:order-info-undefined');
    }
}

function save(data, cb, customRequiredKeys) {
    //actions.log('save=' + JSON.stringify(data))
    actions.log('save:start');

    var prevStatus = '';
    if (data._id) {
        actions.getById(data, (err, _order) => {
            if (!err && _order) prevStatus = _order.status;
            _saveNext();
        });
    }
    else {
        _saveNext();
    }

    

    function _saveNext() {
       
        actions.createUpdate(data, (err, r) => {
            if (err) return cb(err, r);
            cb(err, r);
            ////
            ///Notifications (async)
            actions.log('save:orderPopulate=' + r._id);
            orderPopulate(r, _order => {
                actions.log('save:orderPopulate:rta=' + _order._id);

                actions.log('save:prevStatus=' + prevStatus);
                actions.log('save:currentStatus=' + _order.status);

                //on notification flag change
                if (_order.notifications && _order.notifications.DIAG_NEW_RDV == false) {
                    sendDiagRDVNotification(_order);
                }
                if (_order.notifications && _order.notifications.ADMIN_ORDER_PAYMENT_PREPAID_SUCCESS == false) {
                    sendNotificationToEachAdmin(_order);
                }
                if (_order.notifications && _order.notifications.CLIENT_ORDER_PAYMENT_SUCCESS == false) {
                    sendClientNotifications(_order)
                }

                //on status change
                if (prevStatus == 'created' && _order.status == 'prepaid') { //PREPAID DURING BOOKING
                    sendNotificationToEachAdmin(_order);
                    sendDiagRDVNotification(_order);
                }
                if (prevStatus == 'ordered' && _order.status == 'prepaid') { //PAID AFTER DELEGATION
                    sendNotificationToEachAdmin(_order);
                    sendDiagConfirmedNotification(_order);
                }
                if (prevStatus !== 'prepaid' && _order.status === 'prepaid') {
                    sendClientNotifications(_order);
                }



            });



        }, {}, customRequiredKeys && customRequiredKeys.length && customRequiredKeys || saveKeys);
    }

    function sendNotificationToEachAdmin(_order) {
        //ADMIN_ORDER_PAYMENT_SUCCESS //ADMIN//#8
        everyAdmin(_admin => {
            controllers.notification.trigger(controllers.notification.NOTIFICATION.ADMIN_ORDER_PAYMENT_SUCCESS, {
                _user: _admin,
                _order: _order
            });
        });
    }

    function sendDiagRDVNotification(_order) {
        //DIAG_NEW_RDV //DIAG//#2 OK ctrl.order
        controllers.notification.trigger(controllers.notification.NOTIFICATION.DIAG_NEW_RDV, {
            _user: _order._diag,
            _order: _order
        });
    }

    function sendDiagConfirmedNotification(_order) {
        //DIAG_RDV_CONFIRMED //DIAG//#3
        UserAction.get({
            _id: _order._diag._id || _order._diag
        }, (_err, _diag) => {
            controllers.notification.trigger(controllers.notification.NOTIFICATION.DIAG_RDV_CONFIRMED, {
                _user: _diag,
                _order: _order
            });
        });
    }

    function sendClientNotifications(_order) {
        UserAction.get({
            _id: _order._client._id || _order._client
        }, (_err, _client) => {

            if (_err) return cb(_err);
            if (!_client) {
                LogSave('Unable to retrieve client data', 'error', {
                    _id: _order._client._id || _order._client
                });
                return;
            }

            getInvoiceHTML(_order, (_err, html) => {
                if (_err) {
                    LogSave('Unable to retrieve order invoice html', 'warning', _err);
                }

                if (_order.notifications && _order.notifications.LANDLORD_ORDER_PAYMENT_DELEGATED) {
                    //LANDLORD_ORDER_PAYMENT_SUCCESS //LANDLORD//#2
                    if (_order.landLordEmail) {
                        controllers.notification.trigger(controllers.notification.NOTIFICATION.LANDLORD_ORDER_PAYMENT_SUCCESS, {
                            _user: _client,
                            _order: _order,
                            attachmentPDFHTML: html
                        });
                    }
                }
                else {
                    //CLIENT_ORDER_PAYMENT_SUCCESS //CLIENT//#3
                    controllers.notification.trigger(controllers.notification.NOTIFICATION.CLIENT_ORDER_PAYMENT_SUCCESS, {
                        _user: _client,
                        _order: _order,
                        attachmentPDFHTML: html
                    });
                }

            });

        });
    }

}

function getInvoiceHTML(_order, cb) {
    var Category = controllers.category;
    var Text = controllers.text;
    Category.createUpdate({
        code: "DIAGS_SETTINGS",
        __match: ['code']
    }, (err, _category) => {
        if (err) return cb(err);

        Text.get({
            code: 'INVOICE',
        }, (err, _text) => {
            if (err) return cb(err);
            if (!_text) {
                return cb(null, 'CONFIGURE ORDER INVOICE TEMPLATE');
            }
            var html =
                utils.encodeURIComponent(
                    invoiceHTMLInyectOrderDetails(utils.decodeURIComponent(_text.content), _.cloneDeep(_order)));
            return cb(null, html);
        });
    });
}

function invoiceHTMLInyectOrderDetails(html, _order) {
    _order['ORDER_DESCRIPTION'] = _order.info.description;
    _order['CLIENT_FULLNAME'] = _order._client.firstName + ' ' + (_order._client.lastName || '');
    _order['CLIENT_FIRSTNAME'] = _order._client.firstName;
    _order['CLIENT_LASTNAME'] = _order._client.lastName || '';
    _order['CLIENT_EMAIL'] = _order._client.email;
    _order['CLIENT_ADDRESS'] = _order._client.address;
    _order.createdAt = moment(_order.createdAt).format('DD-MM-YY HH[h]mm');
    //
    var backofficeURL = process.env.adminURL || ''; //blooming-refuge-27843.herokuapp.com/admin#
    if (backofficeURL) {
        backofficeURL = backofficeURL.substring(0, backofficeURL.lastIndexOf('/'));
        // LogSave('Invoice Logo Injected Log','info',{
        //    src: backofficeURL + '/img/logo.jpg'
        // });
        _order["LOGO"] = "<img src='" + backofficeURL + '/img/logo.jpg' + "'>";
    }
    else {
        LogSave('Unable to inject LOGO in invoice. Enviromental variable adminURL required.', 'warning', _order);
        _order["LOGO"] = "";
    }
    //
    return invoiceHTMLReplaceVariable(html, _order);
}

function invoiceHTMLReplaceVariable(html, obj) {
    for (var x in obj) {
        html = utils.replaceAll(html, "{{" + x.toUpperCase() + "}}", obj[x]);
    }
    return html;
}


function everyAdmin(cb) {
    UserAction.getAll({
        userType: 'admin'
    }, (_err, _admins) => {
        _admins.forEach((_admin) => {
            cb(_admin);
        });
    });
}

function orderPopulate(data, cb) {
    actions.get({
        _id: data._id,
        __populate: {
            _client: 'email firstName lastName companyName cellPhone',
            _diag: "email firstName lastName password"
        }
    }, (_err, _order) => cb(_order));
};

function orderDiag(_order, cb) {
    UserAction.get({
        _id: _order._diag._id || _order._diag
    }, (_err, _diag) => cb(_diag));
}

function orderClient(_order, cb) {
    UserAction.get({
        _id: _order._client._id || _order._client
    }, (_err, _client) => cb(_client));
}

function orderExists(data, cb) {
    actions.log('orderExists=' + JSON.stringify(data));
    //Si existe un order match user:email, address, start, end, price.
    actions.getAll({
        __populate: {
            '_client': 'email'
        },
        //'_client.email': data.email,
        address: data.address,
        //diagStart: data.diagStart,
        //diagEnd: data.diagEnd,
    }, (err, list) => {
        actions.log('orderExists:getAll:err:?=' + JSON.stringify(err));
        if (err) return cb(err, list);
        var rta = null;
        var rtaErr = null;
        list.forEach((r) => {
            actions.log('orderExists:getAll:reading=' + JSON.stringify(r._client.email));
            //check dates sameday same hour, same address
            var sameOrder = true && moment(r.diagStart).isSame(data.diagStart, 'day') && moment(r.diagEnd).isSame(data.diagEnd, 'day') && r.price == data.price && r.address == data.address;
            if (!rta) {
                if (r && r._client.email == data.email) {
                    if (sameOrder) {
                        rta = r;
                        rtaErr = 'ORDER_EXISTS';
                        actions.log('orderExists:exists=' + JSON.stringify({
                            sameOrder: sameOrder,
                            clientEmail: r._client.email,
                            clientEmailBooking: data.email
                        }));
                    }
                }
                else {
                    if (sameOrder) {
                        rta = r;
                        rtaErr = 'ORDER_TAKEN';
                        actions.log('orderExists:taken=' + JSON.stringify({
                            sameOrder: sameOrder,
                            clientEmail: r._client.email,
                            clientEmailBooking: data.email
                        }));
                    }
                }
            }
        });
        actions.log('orderExists:rta=' + JSON.stringify(rta));
        return cb(rtaErr, rta); //returns the order as result
    });
}

//Save and order
//If data has _client, use that client. If not, data requires email and clientType to search or crate a new user on the fly.
function saveWithEmail(data, cb) {
    actions.log('saveWithEmail=' + JSON.stringify(data));
    actions.check(data, ['_diag', 'start', 'end'

        , 'diags', 'address', 'price'
    ], (err, r) => {
        if (err) return cb(err, r);
        //
        orderExists(data, (err, r) => {
            if (err) return cb(err, r);

            if (data._client) {
                return save(data, cb);
            }

            if (data._client) {
                if (data._client._id) data._client = data._client._id;
                return save(data, cb);
            }
            else {


                actions.check(data, ['email', 'clientType'], (err, r) => {
                    if (err) return cb(err, r);
                    _setUserUsingEmailAndClientType();
                });
            }

            function _setUserUsingEmailAndClientType() {
                UserAction.get({
                    email: data.email,
                    userType: 'client',
                    clientType: data.clientType,
                }, (err, r) => {
                    if (err) return cb(err, r);
                    actions.log('saveWithEmail=user:get:return' + JSON.stringify(r));
                    if (r) {
                        data._client = r._id;
                        return save(data, cb);
                    }
                    else {
                        UserAction.createClientIfNew({
                            email: data.email
                        }, (err, r) => {
                            if (err) return cb(err, r);
                            data._client = r._id;
                            return save(data, cb);
                        });
                    }
                });
            }
        });
        //    
    });
}

function preSave(data) {


    var now = new Date();
    if (data.status == 'delivered' || data.status == 'completed' && data.deliveredAt === null) {
        data.deliveredAt = now;
    }


    return data;
}

module.exports = {
    //custom
    payUsingLW: payUsingLW,
    getNextInvoiceNumber: getNextInvoiceNumber,
    save: save,
    saveWithEmail: saveWithEmail,
    // pay: pay,
    // syncStripe: syncStripe,
    confirm: confirm,
    populate: orderPopulate,
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
