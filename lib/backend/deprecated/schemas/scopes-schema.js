var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name:'scopes',
    def: {
        description: {
            type: String,
            required: false
        }
    }
};
