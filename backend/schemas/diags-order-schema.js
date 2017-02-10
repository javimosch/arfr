var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    def: {
        _diag: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        _client: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        diags: {
            type: {},
            required: true
        },
        address: {
            type: String,
            required: true
        },
        info: {
            type: {},
            required: false,
            default:{}
        },
        obs: String,
        notifications: {
            type: {},
            default: {}
        },
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            default: 'created'
        },
        price: {
            type: Number,
            required: true,
            default: 0
        },
        priceHT: {
            type: Number,
            required: true,
            default: 0
        },
        diagRemunerationHT: {
            type: Number,
            required: true,
            default: 0
        },
        revenueHT: {
            type: Number,
            required: true,
            default: 0
        },
        vatRate: {
            type: Number,
            required: true,
            default: 0
        },
        vatPrice: {
            type: Number,
            required: true,
            default: 0
        },
        //    time: String, //estimated time.
        fastDiagComm: {
            type: Number,
            default: 0
        }, //
        files: {
            type: {},
            default: {}
        },
        pdfId: String,

        /*client details of an agency*/
        landLordFullName: {
            type: String
        },
        landLordEmail: {
            type: String
        },
        landLordPhone: {
            type: String
        },
        landLordAddress: {
            type: String
        },

        deliveredAt: {
            type: Date,
            default: null
        },
        paidAt: {
            type: Date,
            default: null //date were the order was paid
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },

        //keysWhere:{type:String},
        keysAddress: {
            type: String
        },
        keysTimeFrom: {
            type: Date
        },
        keysTimeTo: {
            type: Date
        },
        
        walletTransId:{
            type:String
        },
        
        number:{
            type:String //Invoice number https://trello.com/c/XrlAbDJQ Spec#3 
            //YYMM(THREE digits counter) for EACH diag
        },

        _charge: {
            type: String
        } //stripe charge associated
    }
};