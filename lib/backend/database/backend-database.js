var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var req = (n) => require(process.cwd() + '/controllers/' + n);
var config = resolver.env();
require('es6-promise').polyfill();
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var dbURI = config.DB_URI;
var models = {};
var schemas = {};
var state = {
    configured: true,
    connected: false,
    logger: resolver.getFacade('logger')({
        name: "DB"
    }),
    gfs: null
};
if (!dbURI) {
    console.warn('dbURI env required');
}
module.exports = {
    state: () => state,
    disconnect: () => {
        mongoose.disconnect()
        state.connected = false;
    },
    waitConnection: waitConnection,
    configure: configure,
    model: models,
    getModel: (n) => {
        if (!models[n.toLowerCase()]) {
            state.logger.warnTerminal("getModel ", n, 'returns null/undefined');
        }
        return models[n.toLowerCase()]
    },
    getSchema: (n) => schemas[n],
    mongoose: mongoose,
    registerModel: registerModel,
    createSchema: createSchema,
};
//********************************************************************


function waitConnection() {
    var start = Date.now();
    return resolver.promise((resolve, reject) => {
        function waitConnection() {
            if (Date.now() - start > 15000) {
                return reject('Timeout');
            }
            if (!state.connected) {
                setTimeout(waitConnection, 1000);
            }
            else {
                return resolve();
            }
        }
        waitConnection();
    });
};

function configure() {
    //console.log('DB:Configure');
    return resolver.promise((resolve, reject) => {
        resolver.co(function*() {
            
            if(!resolver.env().APP_NAME) throw new Error('APP_NAME required')

            if (state.connected) {
                state.logger.debugTerminal('Resuming connection');
                return resolve();
            }

            //console.log('DB:Connecting');
            yield connectMongoose();

            //console.log('DB:GridFS');
            var Grid = require('gridfs-stream');
            Grid.mongo = mongoose.mongo;
            state.gfs = Grid(mongoose.connection.db);

            //state.logger.debugTerminal('DB:Collections');

            yield configureCollections();
            yield configureCollections(path.join(resolver.CONSTANT().SERVER_CUSTOM, resolver.env().APP_NAME, 'models'));


            state.configured = true;
            return true;
        }).then(resolve).catch(reject);
    });
}






//----------------------------------------------------------------------------

function configureCollections(relativePath) {
    relativePath = relativePath || resolver.CONSTANT().SERVER_COMMON_MODELS_PATH;
    state.logger.debugTerminal('configureCollections', relativePath);
    var logger = state.logger;
    return resolver.coWrap(function*() {
        var folderPath = resolver.pathTo(relativePath);
        logger.debugTerminal('Reading ', folderPath);
        var exists = yield resolver.getFacade('fs').exists(folderPath);
        if (!exists) {
            logger.warnTerminal(folderPath, ' should exist.');
            return resolver.Promise.resolve(true);
        }
        var arr = yield resolver.getFacade('fs').readdir(folderPath);
        //logger.debugTerminal(arr);
        arr.forEach(fileName => {
            var module = resolver.require(relativePath, fileName);
            //logger.debugTerminal('Reading ', fileName);
            if (!module.name) {
                logger.warnTerminal('Model require name attribute (string)', fileName);
            }
            if (!module.def) {
                logger.warnTerminal('Model require def (schema definition object) attribute (object)', fileName);
            }
            if (!module.configure) {
                logger.warnTerminal('Model require configure:(schema) attribute (function)', fileName);
            }
            if (!module.name || !module.def || !module.configure) {
                logger.warnTerminal(fileName,'Skip');
                return;
            }
            else {
                var schema = createSchema(module.name, module.def);
                schema = module.configure(schema);
                registerModel(module.name, schema);
                logger.debugTerminal("Model", module.name.toLowerCase(), 'configured OK');
            }
        });
        return resolver.Promise.resolve(true);
    })();
}

function connectMongoose() {
    return resolver.promise((resolve, reject) => {
        mongoose.Promise = global.Promise;

        mongoose.connect(dbURI);
        // CONNECTION EVENTS
        // When successfully connected
        mongoose.connection.on('connected', function() {
            //console.log('DB:Mongoose default connection open to ' + dbURI);
            state.logger.debugTerminal('Connection open', dbURI.substring(dbURI.lastIndexOf('/')));
            state.connected = true;
            resolve();
        });

        // If the connection throws an error
        mongoose.connection.on('error', function(err) {
            state.logger.debugTerminal('Mongoose default connection error: ' + err);
            reject();
        });

        // When the connection is disconnected
        mongoose.connection.on('disconnected', function() {
            state.logger.debugTerminal('Mongoose default connection disconnected');
        });

        // If the Node process ends, close the Mongoose connection 
        process.on('SIGINT', function() {
            mongoose.connection.close(function() {
                state.logger.debugTerminal('Mongoose default connection disconnected through app termination');
                process.exit(0);
            });
        });
    });
}



function createSchema(n, def) {
    if (!def) state.logger.error("Schema definition required", def);
    if (!def.createdAt) {
        def.createdAt = {
            type: Date,
            default: Date.now
        };

    }
    if (!def.updatedAt) {
        def.updatedAt = {
            type: Date,
            default: Date.now
        };
    }
    var schema = new mongoose.Schema(def);
    schema.plugin(mongoosePaginate);
    schema.pre('save', function(next) {
        var now = Date.now();
        this.updatedAt = now;
        if (!this.createdAt) {
            this.createdAt = now;
        }
        next();
    });
    return schema;
}

function registerModel(modelName, schema) {
    models[modelName.toLowerCase()] = mongoose.model(modelName, schema);
    if (!models[modelName.toLowerCase()].paginate) {
        state.logger.warn(modelName, 'Paginate plugin', 'not working');
    }
}

function createModel(n, def) {
    var schema = createSchema(n, def);
    registerModel(n, schema);
    schemas[n] = schema;
}
