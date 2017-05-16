var mongoose = require('../model/backend-database').mongoose;
var moment = require('moment');
var promise = require('../model/utils').promise;
var _ = require('lodash');
var generatePassword = require("password-maker");
var validate = require('../model/validator').validate;
var handleMissingKeys = require('../model/validator').handleMissingKeys;
var User = require('../model/backend-mongoose-wrapper').create('User');
var Order = require('../model/backend-mongoose-wrapper').create('Order');
var Log = require('../model/backend-mongoose-wrapper').create('Log');
var modelName = 'stats';
var actions = {
    log: (m) => {
        console.log(modelName.toUpperCase() + ': ' + m);
    }
};

function cbHell(quantity, cb) {
    return {
        call: () => cb(),
        next: () => {
            quantity--;
            if (quantity === 0) cb();
        }
    }
}

function LogSave(msg, type,data) {
    Log.save({
        message: msg,
        type: type || 'error',
        data:data
    });
}

function currentMonthTotalRevenueHT(data, cb) {
    actions.log('currentMonthTotalRevenueHT:start');
    Order.getAll({
        __rules: {
            createdAt: {
                $gte: moment().startOf('month').toDate(),
                $lt: moment().endOf('month').toDate()
            }
        }
    }, (err, r) => {
        if (err)  actions.log('currentMonthTotalRevenueHT:error: '+JSON.stringify(err));
        if (err) return cb(err, r);
        if(r){
            //
            var totalRevenue = 0;
            r.forEach(_order=>{
                totalRevenue+= _order.revenueHT;
            });
            actions.log('currentMonthTotalRevenueHT:rta:'+totalRevenue);
            cb(null,totalRevenue);
            //
        }else{
            LogSave('monthCommission order getall returns null','error');
            cb(null,0);
        }
    });
}

function general(data, cb) {
    var rta = {};

    function _users() {
        User.model.count({
            userType: 'client'
        }, (err, nroClients) => {
            if (err) cb(null, rta);
            rta.nroClients = nroClients;
            User.model.count({
                userType: 'diag'
            }, (err, nroDiags) => {
                if (err) cb(null, rta);
                rta.nroDiags = nroDiags;
                User.model.count({
                    userType: 'client',
                    clientType: 'landlord'
                }, (err, nro) => {
                    if (err) cb(null, rta);
                    rta.nroLandlords = nro;
                    rta.nroAgencies = nroClients - rta.nroLandlords;
                    _orders();
                });
            });
        });
    }



    function _orders() {
        var _handler = cbHell(5, () => {
            cb(null, rta);
        });

        Order.model.count({
            status: 'created'
        }, (err, nro) => {
            if (err) cb(null, rta);
            rta.nroOrdersCreated = nro;
            _handler.next();
        });

        Order.model.count({
            status: 'ordered'
        }, (err, nro) => {
            if (err) cb(null, rta);
            rta.nroOrdersOrdered = nro;
            _handler.next();
        });

        Order.model.count({
            status: 'prepaid'
        }, (err, nro) => {
            if (err) cb(null, rta);
            rta.nroOrdersPrepaid = nro;
            _handler.next();
        });

        Order.model.count({
            status: 'delivered'
        }, (err, nro) => {
            if (err) cb(null, rta);
            rta.nroOrdersDelivered = nro;
            _handler.next();
        });

        Order.model.count({
            status: 'completed'
        }, (err, nro) => {
            if (err) cb(null, rta);
            rta.nroOrdersCompleted = nro;
            _handler.next();
        });


    }

    _users();
}




module.exports = {
    general: general,
    currentMonthTotalRevenueHT:currentMonthTotalRevenueHT
};
