var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = {
    name: "sessions",
    def: {
        _user: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true,
            unique: true
        },
        token: {
            type: String,
            index: true,
            required: true
        },
        data: {
            type: {},
            required: false,
            default: {}
        },
        expiresAt: {
            type: Date,
            default: Date.now
        }
    },
    configure: (schema) => schema
};
