var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Temporal table
//The transactions belong to one user who navigate the dashboard (stripe transactions).

module.exports = {
    def: {
         _user: { 
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        _order: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            required: false
        },
        description: {
            type: String,
            required: true
        },
        stripeFee: {
            type: Number,
            required: true
        },
        amount: {
            type: String,
            required: true
        },
        created: { //stripe creation date
            type: Date,
            required:true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
};