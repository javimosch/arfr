var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    def: {
        _user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        disabledTypes: {
            type: [],
            default: []
        }, //ex: ['newAccount'] //disable emailing notifications for new accounts.
        notifications: {
            type: [{
                type: Schema.Types.ObjectId,
                ref: 'Notification'
            }],
            default: []
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