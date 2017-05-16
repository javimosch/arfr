var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    def: {
        metadata: {
            type: {}
        },
        pricePercentageIncrease: {},
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }
};