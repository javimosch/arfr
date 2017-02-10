var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    def: {
        appName: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    }
};
