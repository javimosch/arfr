var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    def: {

        email: String,
        userType: {
            type: String,
            default: 'admin'
        }, //admin client diag
        password: String,
        firstName: String,
        lastName: String,

        fixedTel: String,
        cellPhone: String,


        //DIAG / CLIENT
        _orders: [{
            type: Schema.Types.ObjectId,
            ref: 'Order'
        }],

        //google address
        address: String,
        city: String,
        department: String,
        departments: [{
            type: String,
        }],
        region: String,
        country: String,
        postCode: String,

        stripeCustomer: {
            type: String,
            default: null
        },

        //DIAG
        priority: {
            type: Number
        },
        //diagWebsiteComission:{type:Number,default:0},
        diplomes: [{
            type: Schema.Types.ObjectId,
            ref: 'fs.files'
        }],
        diplomesInfo: {
            type: {}
        }, //expiration date, obtention date, file info, etc.
        commission: Number,
        disabled: {
            type: Boolean,
            default: false
        },
        notifications: {
            type: {},
            default: {}
        },


        //CLIENT
        clientType: {
            type: String
        }, //(landlord / agency / Foncière)
        companyName: {
            type: String
        },
        siret: String,
        discount: {
            type: Number,
            default: 0
        },

        //wallet ID
        wallet:{
            type:String,
            default:null
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
