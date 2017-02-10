var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    def: {
        _parent: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
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
    }
};
