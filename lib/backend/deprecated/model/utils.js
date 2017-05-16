var fs = require("fs"),
    json;
var urlencode = require('urlencode2');
var urldecode = require('urldecode');
var moment = require('moment');
var _ = require('lodash');
var snake = require('to-snake-case');
var tempFolderPath = process.env.tempFolderPath || '/backend/temp/';
var filesPath = '/public/files/';

function convertSnakeCaseMiddleToCamelCase(n) {
    var pos = n.indexOf('-');
    if (pos == -1) {
        return n;
    }
    else {
        n = n.substring(0, pos) + n.substring(pos + 1, pos + 2).toUpperCase() + n.substring(pos + 2);
        return convertSnakeCaseMiddleToCamelCase(n);
    }
}
exports.convertSnakeCaseMiddleToCamelCase = convertSnakeCaseMiddleToCamelCase;

function stringToSnakeCaseMiddle(str) {
    return replaceAll(snake(str), '_', '-');
}
exports.stringToSnakeCaseMiddle = stringToSnakeCaseMiddle;

function removeKeys(obj, keys) {
    keys.forEach((k) => {
        if (obj[k] != undefined) {
            delete obj[k];
        }
    })
}
exports.removeKeys = removeKeys;

//Escape commas
function escapeWord(word) {
    return word.replace(/"/g, '\\"');
}

function strIn(str, arr) {
    for (var x in arr) {
        if (str == arr[x]) return true;
    }
    return false;
}
exports.strIn = strIn;

function preserveKeys(obj, keys) {
    var copy = _.clone(obj);
    obj = {};
    for (var x in keys) {
        obj[keys[x]] = copy[keys[x]];
    }
    return obj;
}
exports.preserveKeys = preserveKeys;

function arrayIncludes(arr, string) {
    for (var x in arr) {
        if (arr[x] == string) return true;
    }
    return false;
}

function hasRequiredKeys(obj, keys, callbackFail) {
    for (var x in keys) {
        if (obj[keys[x]] == undefined) {
            callbackFail(keys[x]);
            return false;
        }
    }
    return true;
}
exports.hasRequiredKeys = hasRequiredKeys;

function getFileTempPath(n) {
    var path = process.cwd() + tempFolderPath + (n || '');
    path = replaceAll(path, '//', '/');
    console.log('debug pdf.getFileTempPath', path);
    return path;
}
exports.getFileTempPath = getFileTempPath;

function getFilePath(fileName) {
    var path = process.cwd() + filesPath + (fileName || '');
    path = replaceAll(path, '//', '/');
    console.log('debug getFilePath', path);
    return path;
}
exports.getFilePath = getFilePath;

exports.has = (data, props) => {
    for (var x in props) {
        if (typeof data[props[x]] === 'undefined') return false;
        if (data[props[x]] == undefined) return false;
    }
    return true;
};

exports.encodeURIComponent = urlencode;
exports.decodeURIComponent = urldecode;

exports.formatTime = (d) => {
    return moment(d).format('HH:mm');
};

function readFileSync(file, encoding, json) {
    var filepath = __dirname + '/' + file;
    if (typeof(encoding) == 'undefined') {
        encoding = 'utf8';
    }
    var x = fs.readFileSync(filepath, encoding);
    return (json) ? JSON.parse(x) : x;
}
exports.getJSON = (file) => readFileSync(file, undefined, true);
exports.getFile = (file) => readFileSync(file, undefined, false);

function replaceAll(word, search, replacement) {
    return word.replace(new RegExp(search, 'g'), replacement);
};

exports.replaceAll = replaceAll;

function cbHell(quantity, cb) {
    return {
        call: () => cb(),
        next: () => {
            quantity--;
            console.log('backstuff-utils-cbHell: ' + quantity + ' threads left.');
            if (quantity === 0) cb();
        }
    }
}
exports.cbHell = cbHell;

//routing
function adminUrl(join, angularRoute) {
    var angularRoute = angularRoute || true;
    console.log('Using adminURL VAR: ' + process.env.adminURL);
    var path = process.env.adminURL || 'http://localhost:3000/admin#';
    if (!process.env.adminURL) {
        console.log('process.env.adminURL not found. Using ' + path);
    }
    var url = path + (angularRoute ? '#/' : '') + join;
    url = replaceAll(url, '//', '/');
    url = replaceAll(url, ':/', '://');
    return url;
}
exports.adminUrl = adminUrl;


function MyPromise(cb) {
    var _scope = {
        cb: null,
        errorCb: null,
        errorRes: null,
        res: null,
        evt: {}
    };
    var resolve = function(res) {
        if (_scope.cb) {
            _scope.cb(res);
        }
        _scope.res = res || {};
    };
    var error = function(errorRes) {
        if (_scope.errorCb) {
            _scope.errorCb(errorRes);
        }
        _scope.errorRes = errorRes || {};
    };
    var emit = function(n, err, r) {
        _scope.evt[n] = _scope.evt[n] || {};
        _scope.evt[n].res = {
            err: err,
            r: r
        };
        if (_scope.evt[n].cb !== undefined) {
            _scope.evt[n].cb(_scope.evt[n].res.err, _scope.evt[n].res.r);
        }
    };
    cb(resolve, error, emit);
    var rta = {
        then: function(cb) {
            if (_scope.res) cb(_scope.res);
            else _scope.cb = cb;
            return rta;
        },
        error: function(errorCb) {
            if (_scope.errorRes) errorCb(_scope.errorRes);
            else _scope.errorCb = errorCb;
            return rta;
        },
        err: function(errorCb) {
            if (_scope.errorRes) errorCb(_scope.errorRes);
            else _scope.errorCb = errorCb;
            return rta;
        },
        on: function(n, cb) {
            _scope.evt[n] = _scope.evt[n] || {};
            _scope.evt[n].cb = cb;
            if (_scope.evt[n].res !== undefined) {
                _scope.evt[n].cb(_scope.evt[n].res.err, _scope.evt[n].res.r);
            }
            return rta;
        }
    };
    return rta;
}

exports.promise = MyPromise;
