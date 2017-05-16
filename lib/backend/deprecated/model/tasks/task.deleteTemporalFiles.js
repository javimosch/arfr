var name = 'task:deleteTemporalFiles';
var PRESERVE_TIME  = 1000 * 60 * 10;  //10 minutes
//
var utils = require('../utils');
var _ = require('lodash');
var moment = require('moment');
var ctrl = require('../backend-controllers-manager').create;
var fs = require('fs');
var path = require('path');
var log = (m) => {
    console.log(name + ':' + m);
}
var logSave = (msg, type) => ctrl('Log').save({
    message: msg,
    type: type
});
var ensureDirectory = (path) => {
    if (!fs.existsSync(path))
        fs.mkdirSync(path);
}

function deleteFile(path) {
    try {
        if (fs.existsSync(path)) {
            fs.unlink(path);
        }
    }
    catch (e) {};
}

function replaceAll(word, search, replacement) {
    return word.replace(new RegExp(search, 'g'), replacement);
};

var _testDone = true;

function handler(data, cb) {
    log('start');

    //ensureDirectory(process.cwd() + '/www');
    //ensureDirectory(process.cwd() + '/www/temp');
    var _path = utils.getFileTempPath();

    if (!_testDone) {
        fs.writeFileSync(path.join(_path, "test_" + (new Date().getTime() - (1000 * 60)).toString() + '.pdf'), '');
        _testDone = true;
    }



    fs.readdir(_path, function(err, files) {
        if (err) {
            throw err;
        }
        files.map(function(file) {
            //return path.join(_path, file);
            return file;
        }).filter(function(file) {
            return fs.statSync(path.join(_path, file)).isFile();
        }).forEach(function(file) {
            //log('reading:ext:'+path.extname(file));
            if (path.extname(file) !== '.pdf') {
                log('file:deleting[not-a-pdf-file]');
                deleteFile(path.join(_path, file));
            }
            else {
                try {
                    var str = replaceAll(file, '.pdf', '');
                    str = str.substring(str.indexOf('_') + 1);
                    //log('file:'+str);
                    var d = new Date(parseInt(str));
                    if (isFinite(d)) {
                        if (Date.now() - d > PRESERVE_TIME) {
                            log('file:deleting[createdAt > '+(Date.now() - d) / 1000 + ']');
                            deleteFile(path.join(_path, file));
                        }
                        else {
                            log('file:waiting[createdAt ' + (Date.now() - d) / 1000 + '-secs-ago][to-be-deleted-in '+Math.abs(((Date.now() - d) - PRESERVE_TIME)/1000)+'-secs]');
                        }
                    }
                    else {
                        log('file:deleting[not-a-valid-date]');
                        deleteFile(path.join(_path, file));
                    }
                }
                catch (e) {
                    console.log(e);
                    log('file:deleting[exception]');
                    deleteFile(path.join(_path, file));
                }
            }
        });
    });
}

module.exports = {
    name: name,
    interval: 1000 * 60 * 60, //each hour
    handler: handler,
    startupInterval: true
};
