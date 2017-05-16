var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: 'categories',
    def: {
        _parent: {
            type: Schema.Types.ObjectId,
            ref: 'categories',
            required: false
        },
        code: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        }
    },
    configure: (schema) => schema
};
