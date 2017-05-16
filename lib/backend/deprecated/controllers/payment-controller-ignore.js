var ctrl = require('../model/backend-controllers-manager').create;
var utils = require('../model/utils');
//
var Order = require('../model/backend-mongoose-wrapper').create('Order');
var User = require('../model/backend-mongoose-wrapper').create('User');
var getFile = require('../model/utils').getFile;
var sendEmail = require('../model/utils.mailing').sendEmail;
var moment = require('moment');
var S = require('string');
var btoa = require('btoa')
var adminUrl = require('../model/utils').adminUrl;
var formatTime = require('../model/utils').formatTime;
var _ = require('lodash');

var stripeSecretTokenDEV = "sk_test_P9NzNL96T3X3FEgwOVxw8ovm";
var stripe = require("stripe")(process.env.stripeSecretToken || stripeSecretTokenDEV);


var modelName = 'payment';
var actions = {
    log: (m) => {
        console.log(modelName.toUpperCase() + ': ' + m);
    }
};

//require: _id (charge or refound)
function associatedOrder(data, cb) {
    actions.log('associatedOrder=' + JSON.stringify(data));
    //data.source
    if (data.source.indexOf('ch') !== -1) {
        _charge(data.source);
    }
    else {
        cb(null, null); //not a charge (refund)
        /*
        stripe.refunds.retrieve(
            data.source,
            function(err, refund) {
                if (err) return cb(err, null);
                if (refund) {
                    if (refund.charge) {
                        _charge(refund.charge);
                    }
                    else {
                        cb(null, null);
                    }
                }
                else {
                    cb(null, null);
                }
            }
        );
        */
    }

    function _charge(id) {
        stripe.charges.retrieve(
            id,
            function(err, charge) {
                if (err) return cb(err);
                if (!charge) return cb(null, null);
                actions.log('associatedOrder=chage=metadata=' + JSON.stringify(charge.metadata));
                var _id = charge.metadata._order;
                var _orderDescription = charge.metadata._orderDescription;
                var _orderURL = charge.metadata._orderURL;
                //Order.get({ _id: _id }, (err, _order) => {
                cb(null, {
                    charge: charge,
                    metadata: charge.metadata,
                    _order: {
                        description: _orderDescription,
                        _id: _id
                    }
                });
                //..});
            }
        );
    }
}

function syncTransactions(data, cb) {
    actions.log('syncTransactions=' + JSON.stringify(data));
    if (!data._user) return cb('_user required');
    //
    stripe.balance.listTransactions({}, function(err, transactions) {
        if (err) return cb(err, false);
        //retreive transactions from stripe and customize fields.
        transactions = transactions.data.map(item => {
            item._user = data._user;
            item.created = moment(item.created * 1000);
            item.amount = item.amount / 100;
            //
            var fee = 0;
            item.fee_details.forEach(f => fee += f.amount);
            item.stripeFee = fee / 100;
            //
            return item;
        });
        //-- set _order field in each transaction
        var _associateHell = utils.cbHell(transactions.length, () => {
            console.log('bs debug transactions length',transactions.length);
            console.log('bs debug transactions to remove length',toRemove.length);
            toRemove.forEach(index => {
                transactions.splice(index, 1);
            })
            console.log('syncTransactions - _associateHell - end');
            _save();
        });

        var toRemove = [];
        transactions.forEach((t, tx) => {
            associatedOrder({
                source: t.source
            }, (_err, charge) => {
                if (err) {
                    err.result = charge;
                    LogSave('syncTransactions - associatedOrder - fn  error', err);
                }
                if (!charge) {
                    toRemove.push(tx);
                    console.log('syncTransactions - associatedOrder - no-charge - skip', transactions[tx]._order);
                    return _associateHell.next();
                }

                if (!charge._order || !charge._order._id) {
                    toRemove.push(tx);
                    LogSave('stripe charge without metadata', charge);
                }

                transactions[tx]._order = charge._order._id;
                console.log('syncTransactions - associatedOrder - order get - ', transactions[tx]._order);
                var _order_id = charge._order && charge._order._id || charge._order;
                if (data._diag && _order_id) {

                    ctrl('Order').get({
                        _id: _order_id,
                        __select: "_diag",
                    }, (err, _order) => {
                        if (err) {
                            err.result = charge;
                            LogSave('syncTransactions - associatedOrder -  order get diag - error', err);
                        }
                        else {
                            if (_order) {
                                transactions[tx]._user = _order && _order._diag || null;
                            }
                            else {
                                console.log('bs debug transaction remove because no order',charge._order._id);
                                toRemove.push(tx); //Associated order do not exists
                            }

                        }
                        _associateHell.next();
                    });

                }
                else {
                    toRemove.push(tx);
                    _associateHell.next();
                }


            });
        });
        //-- removes temporal items and save them again.
        function _save() {
            console.log('syncTransactions - StripeTransaction - removeWhen');
            ctrl('StripeTransaction').removeWhen({
                _user: data._user
            }, (err, r) => {
                console.log('syncTransactions - StripeTransaction - ok?', !err);
                if (err) return cb(err, false);
                var hell = utils.cbHell(transactions.length, () => {
                    console.log('syncTransactions - success');
                    return cb(err, true);
                });
                transactions.forEach((transaction, tx) => {
                    console.log('syncTransactions - StripeTransaction - saving', tx);
                    ctrl('StripeTransaction').save(transaction, (err, r) => {
                        if (err) {
                            LogSave('syncTransactions - StripeTransaction:save', err);
                        }
                        hell.next();
                    });
                });
            })
        }
        //
    });
}

function LogSave(msg, data, type) {
    ctrl('Log').save({
        message: msg,
        data: data || {},
        type: type || 'error'
    });
}

function balanceTransactions(data, cb) {


}

function balance(data, cb) {
    stripe.balance.retrieve(function(err, balance) {
        cb(err, balance);
    });
}

function listDiagCharges(data, cb) {
    actions.log('listDiagCharges=' + JSON.stringify(data));
    stripe.charges.list((err, charges) => {
        if (err) return cb(err, null);
        cb(null, charges.data.filter((charge) => {
            return charge.metadata._orderDiag == data._diag;
        }));
    });
}

function diagBalance(data, cb) {
    actions.log('diagBalance=' + JSON.stringify(data));
    listDiagCharges(data, (err, charges) => {
        if (err) return cb(err, charges);
        actions.log('diagBalance:charges=' + JSON.stringify(charges));
        User.get({
            _id: data._diag
        }, (err, _user) => {
            actions.log('diagBalance:user=' + JSON.stringify(_user));
            if (err) return cb(err, charges);
            if (_user) {
                var balance = _.sumBy(charges, (c) => {
                    return c.amount;
                });
                cb(null, {
                    balance: balance,
                    email: _user.email
                });
            }
            else {
                cb("_user not found with " + data._diag);
            }
        });
    });
}

function listCharges(data, cb) {
    actions.log('listCharges=' + JSON.stringify(data));
    //if (!data.stripeCustomer) return cb("listCustomerCharges: stripeCustomer required.", null);
    stripe.charges.list((err, charges) => {
        if (err) return cb(err, null);
        cb(null, charges);
    });
}

function listUncaptured(data, cb) {
    actions.log('listUncaptured=' + JSON.stringify(data));
    var rta = [];
    listCharges(data, (err, chargesR) => {
        chargesR.data.forEach((_charge) => {
            if (!_charge.captured) {
                rta.push(_charge);
            }
        });
        cb(null, rta);
    });
}

function listCustomerCharges(data, cb) {
    actions.log('listCustomerCharges=' + JSON.stringify(data));
    if (!data.stripeCustomer) return cb("listCustomerCharges: stripeCustomer required.", null);
    stripe.charges.list({
        customer: data.stripeCustomer
    }, (err, charges) => {
        if (err) return cb(err, null);
        cb(null, charges);
    });
}

function createCustomer(_user, cb) {
    actions.log('createCustomer=' + JSON.stringify(_user));

    stripe.customers.create({
        email: _user.email,
        metadata: {
            diagUserId: _user._id.toString()
        },
        description: 'Diags custumer',
        source: _user.stripeToken
    }, function(err, customer) {
        if (err) return cb(err, null);
        actions.log('createCustomer:rta=' + JSON.stringify(customer));
        return cb(null, customer);
    });
}

function payOrder(_order, cb) {
    actions.log('payOrder:start');

    if (!_order.stripeToken) return cb("payOrder: stripeToken required.", null);
    if (!_order.stripeCustomer) return cb("payOrder: stripeCustomer required.", null);

    var payload = {
        amount: _order.price * 100, // amount in cents, again
        currency: "eur",
        //source: _order.stripeToken,
        description: "Order payment",
        customer: _order.stripeCustomer,
        metadata: {
            _order: _order._id,
            _orderDiag: _order._diag._id || _order._diag,
            _orderClient: _order._client._id && _order._client._id.toHexString() || _order._client,
            _orderDescription: _order.address + ' (' + formatTime(_order.diagStart) + ' - ' + formatTime(_order.diagEnd) + ')',
            _orderURL: adminUrl('/orders/edit/' + _order._id)
        }
    };

    //if (_order._client.clientType != 'landlord' && _order.landlordEmail) {
    //    payload.receipt_email = _order.landlordEmail;
    //}

    if (_order.info && _order.info.description) {
        payload.statement_descriptor = _order.info.description.substring(0, 19) + '...';
    }

    if (_order.stripeTokenEmail) {
        payload.receipt_email = _order.stripeTokenEmail;
    }

    actions.log('payOrder:payload' + JSON.stringify(payload));

    stripe.charges.create(payload, (err, _charge) => {
        if (err) { // && err.type === 'StripeCardError'
            // The card has been declined
            cb(err, null);
        }
        else {
            actions.log('payOrder:rta=' + JSON.stringify(_charge));

            captureOrderCharge(_charge); //async

            cb(null, _charge)
        }
    });
}

function captureOrderCharge(charge, cb) {
    actions.log('captureOrderCharge:start=' + JSON.stringify(charge));
    stripe.charges.capture({
        charge: charge.id,
        statement_descriptor: (process.env.companyName || 'Diags S.A') + ' - Custom inspection.'
    }, function(err, charge) {
        // asynchronously called
        if (err) {
            actions.log('captureOrderCharge:error=' + JSON.stringify(err));
        }
        actions.log('captureOrderCharge:rta=' + JSON.stringify(charge));
    });
}

//exports.stripe = stripe;
module.exports = {
    syncTransactions: syncTransactions,
    stripe: stripe,
    listDiagCharges: listDiagCharges,
    diagBalance: diagBalance,
    payOrder: payOrder,
    createCustomer: createCustomer,
    listCustomerCharges: listCustomerCharges,
    listCharges: listCharges,
    listUncaptured: listUncaptured,
    balance: balance,
    balanceTransactions: balanceTransactions,
    associatedOrder: associatedOrder
};
