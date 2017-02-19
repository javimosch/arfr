var createMongooseWrapperActions = require('./backend-mongoose-wrapper').create;
var db = require('./backend-database');
var path = require('path');
var stringToSnakeCaseMiddle = require('./utils').stringToSnakeCaseMiddle;
var convertSnakeCaseMiddleToCamelCase = require('./utils').convertSnakeCaseMiddleToCamelCase;
var Promise = require('./utils').promise;
var replaceAll = require('./utils').replaceAll;
var fs = require('fs');
var co = require('co');

const LOG_CONTROLLER_NAME = 'logs';

var EXPORT = {
    _co: function(coFn, cb, logger) {
        co(coFn).catch(res => {
            cb(res);
            if (logger) return logger.error(res);
            if (LoggerController) return LoggerController.error(res);
            return console.log("DEBUG ERROR CO CATCH", res);
        })
    },
    _start: readFolterAndRegister,
    _markAsSchemeless: markAsSchemeless,
    _normalizeControllerName: normalizeControllerName
};
module.exports = EXPORT;

var LoggerController = create(LOG_CONTROLLER_NAME).createLogger({
    name: "API",
    category: "Controllers"
});


var schemelessModels = [];


function readFolterAndRegister() {
    return Promise(function(resolve, error, emit) {
        var readDirFiles = require('read-dir-files');
        readDirFiles.list(path.join(process.cwd(), 'backend', 'controllers'), function(err, filenames) {
            if (err) {
                error(err);
                return console.log(err);
            }
            filenames.forEach(function(path) {
                path = path.substring(path.lastIndexOf('/') + 1).replace('.js', '');
                if (path.indexOf('ignore') != -1) return;
                if (!path) return;
                register(path);
            });
            resolve();
        });
    });
}

function markAsSchemeless(array) {
    var name;
    for (var x in array) {
        name = array[x];
        name = stringToSnakeCaseMiddle(name);
        name = replaceAll(name, '-controller', '');
        schemelessModels.push(name);
    }
}

function isAnSchemelessModel(name) {
    name = normalizeControllerName(name)
    for (var x in schemelessModels) {
        if (schemelessModels[x] == name) return true;
    }
    return false;
}

function isMongooseCollection(name) {
    return db.getModel(name) !== undefined;
}


function getControllerPath(name) {
    name = stringToSnakeCaseMiddle(name);
    var fileName = name.toLowerCase();
    if (fileName.indexOf('-controller') == -1) {
        fileName += '-controller';
    }
    return path.join(process.cwd(), 'backend', 'controllers', fileName);
}



function normalizeControllerName(name) {
    name = stringToSnakeCaseMiddle(name);
    name = replaceAll(name, '-controller', '');
    name = replaceAll(name, '-schema', '');
    return convertSnakeCaseMiddleToCamelCase(name);
}

function registerController(name, actions) {
    EXPORT[normalizeControllerName(name)] = actions;
}

function isControllerRegistered(name) {
    return EXPORT[normalizeControllerName(name)] !== undefined;
}

function getControllerActions(name) {
    return EXPORT[normalizeControllerName(name)];
}

function register(modelName) {
    if (isControllerRegistered(modelName)) return;
    modelName = normalizeControllerName(modelName);
    if (!db.getModel(modelName)) {
        var def = {};
        if (!isAnSchemelessModel(modelName)) {
            var snakeCaseName = stringToSnakeCaseMiddle(modelName);
            var schemaPath = path.join(process.cwd(), "backend", "schemas", snakeCaseName + '-schema.js');

            if (fs.existsSync(schemaPath)) {
                try {
                    def = require(schemaPath).def;
                }
                catch (e) {};
            }
            if (LoggerController) {
                if (!fs.existsSync(schemaPath)) {
                    LoggerController.warn('Schema', schemaPath.substring(schemaPath.lastIndexOf('/') + 1), 'required');
                }
            }
        }
        //if(LoggerController)LoggerController.debug('setModel ',modelName,'with ',Object.keys(def).length,'fields');
        db.setModel(modelName, def, isAnSchemelessModel(modelName));

    }
    var _actions = createCommonActions(modelName);
    
    var _coreActions = null;
    if (isMongooseCollection(modelName)) {
        _coreActions = createMongooseWrapperActions(modelName);
        Object.assign(_actions, _coreActions);
    }
    
    var _customActions = {};
    _customActions = require(getControllerPath(modelName));
    Object.assign(_actions, _customActions);
    
    if(_coreActions){
        _actions.core = _coreActions;
    }

    if (_actions._configure && !_actions._configuredFlag) {
        _actions._configuredFlag = true
        _actions._configure(_actions._hook);
    }
    registerController(modelName, _actions);
}

function create(name) {
    register(name);
    return getControllerActions(name);
}


var LoggerResponse = create(LOG_CONTROLLER_NAME).createLogger({
    name: "API",
    category: "ACTION/RESPONSE"
});

function createCommonActions(name) {
    var self = {};



    function result(res, options) {
        return function(err, r) {
            if (typeof err == 'string' ||
                (Object.keys(err || {}).length == 0 && err != undefined)) {
                err = {
                    message: err.toString()
                };
            }
            var rta = {
                ok: !err,
                message: (err) ? 'Error' : 'Success',
                err: err || null,
                result: (r !== null) ? r : ((r === false) ? false : null)
            };
            if (!rta.ok) {
                LoggerResponse.warn(name, err);
            }
            else {
                LoggerResponse.debug(name, rta.result);
            }
            if (rta.result && rta.result.result) {
                if (rta.result.message) {
                    rta.message = rta.result.message;
                    rta.result = rta.result.result;
                }
            }
            if (options && options.__res) {
                options.__res(res, rta);
            }
            else {
                res.json(rta);
            }
        };
    }
    self.result = result;
    return self;
}
