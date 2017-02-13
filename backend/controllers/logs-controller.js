var moment = require('moment');
var createIfNotExist = require("create-if-not-exist");
var fs = require('fs');
const FILE_NAME = process.cwd() + '/log.txt';
const VERBOSE_LEVEL = (process.env.VERBOSE_LEVEL || 'DEBUG').toUpperCase();
var CTRL = require('../model/backend-controllers-manager');
module.exports = {
    createLogger: function(data, cb) {
        createIfNotExist(data.fileName || FILE_NAME, '');
        if (cb) return cb('Private action');
        const LOG_PREFIX = data.name;
        const CAT_PREFIX = data.category;
        var isAppending = false;

        function appendFile(str) {
            setTimeout(() => {
                if (isAppending) return appendFile(str);
                isAppending = true;

                if (typeof str == 'object') {
                    //str = JSON.stringify(str);
                }

                try {
                    var newStr = '';
                    if (str.forEach) {
                        str.forEach(string => {
                            if (typeof string == 'string') {
                                newStr += string+' ';
                            }
                            else {
                                newStr += JSON.stringify(string)+' ';
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



                fs.appendFile(FILE_NAME, str + '\n', function() {
                    isAppending = false;
                });
            }, 200);
        }

        function log(args, level, saveInDatabase) {
            if (VERBOSE_LEVEL == 'NONE') return;
            if (VERBOSE_LEVEL == 'WARN' && level == 'DEBUG') return;
            if (VERBOSE_LEVEL == 'ERROR' && level == 'DEBUG') return;
            if (VERBOSE_LEVEL == 'ERROR' && level == 'WARN') return;
            args.unshift("[" + level.toUpperCase() + "]");
            args.unshift(CAT_PREFIX + "");
            args.unshift('' + moment().format('HH:mm DDMMYY') + "");
            args.unshift(LOG_PREFIX + "");
            console.log.apply(console, args);
            appendFile(args);
            if (saveInDatabase) {
                CTRL.LOG.save({
                    level: level,
                    message: args.join(' ')
                });
            }
        }
        return {
            debug: function() {
                log(Array.prototype.slice.call(arguments), 'DEBUG');
            },
            debugSave: function() {
                log(Array.prototype.slice.call(arguments), 'DEBUG', true);
            },
            log: function() {
                log(Array.prototype.slice.call(arguments), 'DEBUG');
            },
            info: function() {
                log(Array.prototype.slice.call(arguments), 'DEBUG');
            },
            warn: function() {
                log(Array.prototype.slice.call(arguments), 'WARN');
            },
            warnSave: function() {
                log(Array.prototype.slice.call(arguments), 'WARN', true);
            },
            error: function() {
                log(Array.prototype.slice.call(arguments), 'ERROR');
            },
            errorSave: function() {
                log(Array.prototype.slice.call(arguments), 'ERROR', true);
            }
        }
    }
};
