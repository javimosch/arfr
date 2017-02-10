var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name:"meetfulEventUser",
    def: {
        _user: {
            type: Schema.Types.ObjectId,
            ref: 'muser',
            required:true
        },
        _event: {
            type: Schema.Types.ObjectId,
            ref: 'mevent',
            required:true
        },
        enabled: {
            type: Boolean,
            required: true
        },
        message: {
            type: String
        }
    }
};
