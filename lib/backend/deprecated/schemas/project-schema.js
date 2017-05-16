var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    def: {
        name: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true
        },
        short_description: {
            type: String,
            required: true
        },
        _tasks: [{
            type: Schema.Types.ObjectId,
            ref: 'task',
            default: []
        }],
        description: {
            type: String,
            required: false
        }
    }
};
