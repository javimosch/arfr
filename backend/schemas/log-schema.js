var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name:'log',
    def: {
        category:{
          type:String,
          default:'other'
        },
        level: {
            type: String,
            default: 'error'
        }, //DEBUG, WARN, ERROR.
        message: {
            type: {}
        },
        data: {
            type: {},
            default: {}
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }
};