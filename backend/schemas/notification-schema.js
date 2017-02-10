var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    def: {
        _config: {
            type: Schema.Types.ObjectId,
            ref: 'UserNotifications',
            required: true
        },
        _user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            required: true
        },
        to: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            required: true
        },
        contents: {
            type: String,
            required: true
        },
        sended: {
            type: Boolean,
            default: false
        },
        sendedDate: {
            type: Date
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