var Stripe = require('../model/backend-mongoose-wrapper').create('Stripe');
var User = require('../model/backend-mongoose-wrapper').create('User');
var Log = require('../model/backend-mongoose-wrapper').create('Log');
var UserNotifications = require('../model/backend-mongoose-wrapper').create('UserNotifications');
var Notification = require('../model/backend-mongoose-wrapper').create('Notification');
var getFile = require('../model/utils').getFile;
var sendEmail = require('../model/utils.mailing').sendEmail;
var moment = require('moment');
var S = require('string');
var btoa = require('btoa')
var _ = require('lodash');
var modelName = 'stripe';
var stripeSecretTokenDEV = "sk_test_P9NzNL96T3X3FEgwOVxw8ovm";
var stripe = require("stripe")(process.env.stripeSecretToken || stripeSecretTokenDEV);
var actions = {
    log: (m) => {
        console.log(modelName.toUpperCase() + ': ' + m);
    }
};
var infolog = function(msg, data) {
    Log.save({
        message: msg,
        type: "info",
        data: data || {}
    });
}


function getCustomers(data, cb) {
    actions.log('getCustomers=' + JSON.stringify(data));
    stripe.customers.list({
            limit: 3
        },
        function(err, res) {
            if (err) return cb(err, null);
            return cb(null, res.data);
        }
    );
}

function createCustomer(data, cb) {
    actions.log('createCustomer=' + JSON.stringify(data));
    if (!data.token) return cb("createCustomer: token required.", null);
    if (!data.email) return cb("createCustomer: email required.", null);
    stripe.customers.create({
        email: data.email,
        source: data.token
    }, function(err, res) {
        if (err) return cb(err, null);
        return cb(null, res.data);
    });
}

function getCustomer(data, cb) {
    actions.log('getCustomer=' + JSON.stringify(data));
    if (!data.token) return cb("getCustomer: token required.", null);
    if (!data.email) return cb("getCustomer: email required.", null);
    var customer = null;
    getCustomers(data, function(err, arr) {
        if (err) return cb(err, null);
        arr.forEach(c => {
            if (c.email == data.email) customer = c;
        });
        if (!customer) createCustomer(data, cb);
        else return cb(null, customer);
    });
}

function makePayment(data, cb) {
    actions.log('makePayment=' + JSON.stringify(data));
    if (!data.token) return cb("makePayment: token required.", null);
    if (!data.amount) return cb("makePayment: amount required.", null);
    if (!data.email) return cb("makePayment: email required.", null);
    if (!data.description) return cb("makePayment: description required.", null);
    if (!data.currency) return cb("makePayment: currency required.", null);
    if (!data.statement_descriptor) return cb("makePayment: statement_descriptor required.", null);
    getCustomer(data, function(err, customer) {
        if (err) return cb(err, null);
        else {
            actions.log('makePayment:customer=' + JSON.stringify(customer));
            var charge = stripe.charges.create({
                amount: data.amount * 100, // amount in cents, again
                currency: data.currency,
               // source: data.token,
                description: data.description,
                customer: customer.id,
                metadata: data.metadata || {},
                capture: data.capture || true,
                statement_descriptor:data.statement_descriptor||''
            }, (err, charge) => {
                if (err) { 
                    // && err.type === 'StripeCardError'
                    cb(err, null); // The card has been declined
                    infolog('payment-failed', {
                        customer: customer,
                        charge: charge,
                        metadata:data.metadata||{},
                        err:err
                    });
                }
                else {
                    actions.log('makePayment:rta=' + JSON.stringify(charge));
                    cb(null, "payment-success");
                    infolog('payment-success', {
                        customer: customer,
                        charge: charge,
                        metadata:data.metadata||{}
                    });
                }
            });
        }
    })
}


exports.actions = {
    makePayment: makePayment,
    createCustomer: createCustomer
};
