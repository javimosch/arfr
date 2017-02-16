var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: 'pages',
    def: {
        code: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true,
            unique: true
        },
        template: {
            type: String,
            required: true,
            default: ''
        },
        content: {
            type: String,
            required: true,
            default: ''
        }
    }
};
