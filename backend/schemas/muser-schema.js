var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    def: {
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        first_name: {
            type: String,
            required: true
        },
        last_name: {
            type: String,
            required: true
        },
        roles: [{
            type: String,
            required: true
        }],
        pictures: {
            type: {},
            default: {}
        }
    }
};
