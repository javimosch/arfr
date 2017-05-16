var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: 'mevent',
    def: {
        _owner: {
            type: Schema.Types.ObjectId,
            ref: 'muser',
            required: true
        },
        _users: [{
            type: Schema.Types.ObjectId,
            ref: 'muser'
        }],
        _messages: [{
            type: Schema.Types.ObjectId,
            ref: 'meetfulEventMessages',
            default: []
        }],
        name: {
            type: String,
            required: true
        },
        short_description: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: false
        },
        date: {
            type: String,
            required: false
        },
        tags: {
            type: {},
            required: true
        },
        status: {
            type: String,
            required: true
        }
    }
};
