var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name:'texts',
    def: {
        _category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: false
        },
        code: {
            type: String,
            required: true,
            unique: true
        }, //EX: BOOKING_DPE_TITLE_2_CONTENT
        description: {
            type: String,
            required: false
        },
        content: {
            type: {},
            required: true
        },
        updatedByHuman: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    configure: schema => schema
};
