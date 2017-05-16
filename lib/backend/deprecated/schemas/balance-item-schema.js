var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    def: {
        _user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        _order: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        },
        description: {
            type: String,
            required: true
        },
        pending: {
            type: Boolean,
            required: true
        },
        amount: {
            type: String,
            required: true
        },
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