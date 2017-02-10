var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    def: {
        code: {
            type: String,
            required: true
        },
        number:{
            type:Number,
            required:true
        },
        short_description: {
            type: String,
            required: true
        },
        _project: {
            type: Schema.Types.ObjectId,
            ref: 'project',
            required: true
        },
        description: {
            type: String,
            required: false
        }
    }
};
