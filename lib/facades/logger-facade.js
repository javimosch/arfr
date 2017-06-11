var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var createIfNotExist = require("create-if-not-exist");
var moment = require('moment');
var _ = require('lodash');
var fs = require('fs');
const FILE_NAME = process.cwd() + '/log.txt';
const VERBOSE_LEVEL = (process.env.VERBOSE_LEVEL || 'DEBUG').toUpperCase();

const FILE_LOGGING_LEVEL = resolver.env().FILE_LOGGING_LEVEL;

var logger = create({
    name: "LOGGER",
    category: ""
});


var loggers = {};
var self = function(options) {
    if (!options) {
        logger.errorTerminal("Implementation error: loggerFacade options undefined");
        process.exit(1);
    }
    if (!options.name) {
        logger.errorTerminal('name attribute required');
        process.exit(1);
    }
    var id = options.name + (options.category ? "_" + options.category : "");
    if (loggers[id]) {
        return loggers[id];
    }
    loggers[id] = create(options);
    return loggers[id];
};
self.create = create;
module.exports = self;

function create(data, cb) {
    createIfNotExist(data.fileName || FILE_NAME, '');
    const LOG_PREFIX = data.name;
    const CAT_PREFIX = data.category;
    var isAppending = false;
    var appendToFileStack = []; //First in, first out
    function processFileAppendingQueue() {
        if (appendToFileStack.length === 0) return;
        var str = appendToFileStack[0];
        appendToFileStack.splice(0, 1);
        fs.appendFile(FILE_NAME, str + '\n', function() {
            processFileAppendingQueue();
        });
    }

    function appendFile(str) {
        str = getParsedFileString(str);
        appendToFileStack.push(str);
        processFileAppendingQueue();
    }

    function getParsedFileString(str) {
        if (typeof str == 'object') {
            //str = JSON.stringify(str);
        }
        try {
            var newStr = '';
            if (str.forEach) {
                str.forEach(string => {
                    if (typeof string == 'string') {
                        newStr += string + ' ';
                    }
                    else {
                        newStr += JSON.stringify(string) + ' ';
                    }
                });
                str = newStr;
            }
            else {
                str = str.join(' ');
            }
        }
        catch (err) {
            try {
                str = JSON.stringify(str);
            }
            catch (err) {
                str = "OBJECT (Parse fail)";
            }
        }
        return str;
    }

    var saveData = {};

    function createSpaces(prefix, len) {
        while (prefix.length < len) {
            prefix += ' ';
        }
        return prefix;
    }


    function logFile(args, level) {
        if (FILE_LOGGING_LEVEL.toUpperCase().indexOf('WARN') != -1 && level === 'DEBUG') {
            return; //WARN -> DISABLES DEBUG
        }
        if (FILE_LOGGING_LEVEL.toUpperCase().indexOf('WARN') != -1 && level === 'INFO') {
            return; //WARN -> DISABLES INFO
        }
        if (FILE_LOGGING_LEVEL.toUpperCase().indexOf('ERROR') != -1 && level !== 'ERROR') {
            return; //ERROR -> DISABLES DEBUG, INFO, WARN
        }
        appendFile(args);
    }

    function log(args, level, saveInDatabase, saveInFile) {
        saveInDatabase = saveInDatabase === undefined ? false : saveInDatabase;
        saveInFile = saveInFile === undefined ? true : saveInFile;

        if (VERBOSE_LEVEL == 'NONE') return;
        if (VERBOSE_LEVEL == 'INFO' && level == 'DEBUG') return;
        if (VERBOSE_LEVEL == 'WARN' && level == 'DEBUG') return;
        if (VERBOSE_LEVEL == 'WARN' && level == 'INFO') return;
        if (VERBOSE_LEVEL == 'ERROR' && level == 'DEBUG') return;
        if (VERBOSE_LEVEL == 'ERROR' && level == 'WARN') return;
        var originalArgs = _.clone(args);

        args.unshift(createSpaces((CAT_PREFIX || '') + "", 14));
        args.unshift(createSpaces((LOG_PREFIX || 'OTHER') + "", 14));
        args.unshift('' + moment().format('HH:mm:ss DDMMYY') + "");
        args.unshift(createSpaces("[" + level.toUpperCase() + "]", 8));
        console.log.apply(console, args);
        if (saveInFile) {
            logFile(args, level)
        }
        if (saveInDatabase && resolver.db().state().connected) {
            originalArgs.unshift(CAT_PREFIX + "");
            resolver.ctrl('Log').save({
                level: level.toLowerCase(),
                type: level.toLowerCase(),
                category: LOG_PREFIX,
                message: originalArgs.join(' '),
                data: saveData
            });
            saveData = {};
        }
    }
    var self = {
        debug: function() {
            log(Array.prototype.slice.call(arguments), 'DEBUG');
        },
        debugTerminal: function() {
            log(Array.prototype.slice.call(arguments), 'DEBUG', false, false);
        },
        debugSave: function() {
            log(Array.prototype.slice.call(arguments), 'DEBUG', true);
        },
        log: function() {
            log(Array.prototype.slice.call(arguments), 'DEBUG');
        },
        logSave: function() {
            log(Array.prototype.slice.call(arguments), 'DEBUG', true);
        },
        logTerminal: function() {
            log(Array.prototype.slice.call(arguments), 'DEBUG', false, false);
        },
        info: function() {
            log(Array.prototype.slice.call(arguments), 'INFO');
        },
        infoSave: function() {
            log(Array.prototype.slice.call(arguments), 'INFO', true);
        },
        infoTerminal: function() {
            log(Array.prototype.slice.call(arguments), 'INFO', false, false);
        },
        warnTerminal: function() {
            log(Array.prototype.slice.call(arguments), 'WARN', false, false);
        },
        warn: function() {
            log(Array.prototype.slice.call(arguments), 'WARN');
        },
        warnSave: function() {
            log(Array.prototype.slice.call(arguments), 'WARN', true);
        },
        errorTerminal: function() {
            log(Array.prototype.slice.call(arguments), 'ERROR', false, false);
        },
        error: function() {
            log(Array.prototype.slice.call(arguments), 'ERROR');
        },
        errorSave: function() {
            log(Array.prototype.slice.call(arguments), 'ERROR', true);
        },
        setSaveData: function(data) {
            saveData = data;
            return self;
        },
        withData: function(data) {
            saveData = data;
            return self;
        }
    };
    return self;
};
