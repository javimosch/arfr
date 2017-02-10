var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    def: {
        _owner: {
            type: Schema.Types.ObjectId,
            ref: 'muser',
            required:true
        },
        _users:[{
            type:Schema.Types.ObjectId,
            ref:'meetfulEventUser'
        }],
        _messages:[{
            type:Schema.Types.ObjectId,
            ref:'meetfulEventMessages',
            default:[]
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
        tags: {
            type: {},
            required: true
        }
    }
};
