var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    def: {
        _user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        description: {
            type: String,
            required: false
        },
        type: {
            type: String,
            required: true,
            default: 'work-exception'
        },
        weekday:{
            type:Number,
            required:false,
            default:null
        },
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        },
        repeat: {
            type: String,
            required: true
        }, //day, week, none
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