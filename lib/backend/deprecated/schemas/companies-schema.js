var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: "companies",
    def: {
        _group: {
            type: Schema.Types.ObjectId,
            ref: 'groups',
            required: true
        },
        code: {
            type: String
        },
        name: {
            type: String
        }
    }
};
