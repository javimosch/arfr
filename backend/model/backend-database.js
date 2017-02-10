var requireController = (n) => require('../controllers/' + n + '-controller');
var path = require('path');
var fs = require('fs');
require('es6-promise').polyfill();
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var configureGridFS = requireController('file').configure;
var configureGridFSActions = requireController('file').configureActions;
var Schema = mongoose.Schema;
var LOCAL = process.env.LOCAL && process.env.LOCAL.toString() == '1' || false;
var Promise = require('./utils').promise;
// Build the connection string 
var dbURI = 'mongodb://root:root@ds011452.mlab.com:11452/manitas';



if (LOCAL) {
    dbURI = 'mongodb://localhost:27017/scotchbox';
}

if (process.env.dbURI) {
    dbURI = process.env.dbURI || dbURI;
}


var Mongorito = require('mongorito');
var co = require('co');
var MONGOOSE_URI = require('../model/backend-database').dbURI;
exports.Mongorito = Mongorito;
exports.co = co;
exports.connect = function*() {
    yield Mongorito.connect(MONGOOSE_URI);
};


// Create the database connection 
//console.log('using',dbURI);
mongoose.Promise = global.Promise;
mongoose.connect(dbURI);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function() {
    console.log('Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error', function(err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {
    mongoose.connection.close(function() {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

configureGridFS(mongoose);





var models = {};
var schemas = {};

exports.dbURI = dbURI;
exports.getModel = (n) => models[n];
exports.setModel = (n, def, isDynamic) => {
    model(n, def, isDynamic);
};
exports.getSchema = (n) => schemas[n];
exports.mongoose = mongoose;

function registerSchemasAutomagically() {
    return Promise(function(resolve, error, emit) {
        var readDirFiles = require('read-dir-files');
        readDirFiles.list(path.join(process.cwd(), 'backend', 'schemas'), function(err, filenames) {
            if (err) {
                error(err);
                return console.log(err);
            }
            filenames.forEach(function(fileName) {
                fileName = fileName.substring(fileName.lastIndexOf('/') + 1).replace('.js', '');
                if (fileName.indexOf('ignore') != -1) return;
                if (!fileName) return;
                

                var schemaPath = path.join(process.cwd(), "backend", "schemas", fileName + '.js');

                if (fs.existsSync(schemaPath)) {
                    try {
                        var schemaFile = require(schemaPath);
                        if(schemaFile.name){
                            model(schemaFile.name,schemaFile.def,false);
                            //console.log("DB SCHEMA REGISTER", fileName,'as',schemaFile.name);
                        }
                    }
                    catch (e) {};
                }

            });
            resolve();
        });
    });
}
registerSchemasAutomagically();

function model(n, def, isDynamic) {
    isDynamic = (isDynamic == undefined) ? false : isDynamic;
    if (schemas[n]) return;
    if (!def) console.log('WARN:' + n + ' def required');
    //if (!isDynamic) {
    if (!def.created_at) {
        def.created_at = {
            type: Date,
            default: Date.now
        };

    }
    if (!def.updated_at) {
        def.created_at = {
            type: Date,
            default: Date.now
        }
    }
    //}
    var options = {
        strict: true
    };
    if (isDynamic) {
        //def = {};
        options.strict = false;
        //console.log('DYNAMIC MODEL ',n);
    }
    else {
        //console.log('FIXED MODEL ',n);
    }

    //console.log(n,def);
    var schema = new mongoose.Schema(def);
    schema.plugin(mongoosePaginate);
    schema.pre('save', function(next) {
        var now = new Date();
        this.updatedAt = now;
        if (!this.createdAt) {
            this.createdAt = now;
        }
        next();
    });
    models[n] = mongoose.model(n, schema);
    schemas[n] = schema;
}


require('./mongorito-schemas')
configureGridFSActions();
