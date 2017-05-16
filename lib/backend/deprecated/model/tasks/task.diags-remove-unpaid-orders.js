var name = 'task:diags-remove-unpaid-orders';
var _ = require('lodash');
var moment = require('moment');
var ctrl = require('../backend-controllers-manager').create;
var fs = require('fs');
var path = require('path');
var LogSave = (msg, data, type) => ctrl('Log').save({
    message: msg,
    type: type || 'error',
    data: data
});
module.exports = {
    name: name,
    interval: 1000 * 60 * 10, //each minutes
    handler: handler,
    startupInterval: false,
    startupIntervalDelay: 1000,
};

function handler(data, cb) {
    //console.log('remove-unpaid-orders', 'start');
    //
    var Order = ctrl('Order');
    Order.getAll({
        status: "created"
    }, (err, orders) => {
        //console.log('bs debug task orders get-all success', !err);
        if (err) return LogSave(name + " error", err);
        orders.forEach(_order => {
           // console.log('bs debug task order id', _order._id);
            if (Date.now() - new Date(_order.createdAt) > 1000 * 60 * 30) {
                //console.log('bs debug task order remove');
                Order.remove(_order, (err) => {
                    //console.log('bs debug task order remove success', !err);
                    if (err) return LogSave(name + " error", err);

                    LogSave('Unpaid order removed.', _order, 'info');
                });
            }
        })
    });
    //
    //console.log('remove-unpaid-orders', 'end');
}
