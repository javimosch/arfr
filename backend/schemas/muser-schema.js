var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: 'muser',
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
            required: false
        },
        last_name: {
            type: String,
            required: false
        },
        roles: [{
            type: String,
            required: false
        }],
        pictures: {
            type: {},
            default: {}
        }
    }
};
