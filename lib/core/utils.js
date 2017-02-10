"use strict"

var watch = require('watch');
var gwatch = require('gulp-watch');
var readDirFiles = require('read-dir-files');
var fs = require('fs');
var mkdirp = require('mkdirp');
var Handlebars = require('handlebars');
var del = require('del');
var path = require("path");
var sander = require('sander');
var util = require('util');
var moment = require('moment');
var urlencode = require('urlencode');
var urldecode = require('urldecode');
var absolute_path = require('relative-path');
var Watch = require('fs-watcher').watch;


module.exports = {
    watch: watchHelper,
    normalizeFilesTreePreservePath: normalizeFilesTreePreservePath,
    getPaths: getPaths,
    normalizeFilesTree: normalizeFilesTree,
    filesIncludeOnly: filesIncludeOnly,
    cbHell: cbHell,
    copyFilesFromTo: copyFilesFromTo,
    concatenateAllFilesFrom: concatenateAllFilesFrom,
    concatenateAllFilesFromArray: concatenateAllFilesFromArray,
    createFile: createFile,
    deleteFiles: deleteFiles,
    clear: clear,
    ensureDirectory: ensureDirectory,
    retrieveFilesFromPathSync: retrieveFilesFromPathSync,
    replaceAll: replaceAll,
    fileStat: fileStat,
    fileIsAfterDate: fileIsAfterDate,
    urldecode: urldecode,
    urlencode: urlencode
}



function* fileIsAfterDate(path, date) {
    let file = yield fileStat(path);
    if (file) {
        var mtime = new Date(util.inspect(file.stats.mtime))
        return moment(mtime).isAfter(moment(date));
    }
    return false;
}

function fileStat(fullPath) {
    return new Promise((resolve, err) => {
        fs.stat(fullPath, function(err, stats) {
            resolve({
                err: err,
                stats: stats
            });
        });
    })
}

function clear(folderPath, globs) {
    globs = globs.map(g => g = (folderPath + '/' + g).replace('//', '/'));
    //console.log('DEBUG: UTILS-CLEAR', globs);
    del.sync(globs);
    fs.mkdirSync(folderPath);
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function replaceAll(str, search, replacement) {
    return str.replace(new RegExp(search, 'g'), replacement);
}

function deleteFiles(glob) {
    return new Promise((resolve, err) => {
        del(glob).then(paths => {
            //console.log('debug-delete success  files and folders:\n', paths.join('\n'));
            resolve();
        });
    })
}

function ensureDirectory(path) {
    if (!fs.existsSync(path))
        fs.mkdirSync(path);
}

function concatenateAllFilesFromArray(arr) {
    var raws = [];
    arr.forEach(path => {
        raws.push(fs.readFileSync((process.cwd() + '/' + path).replace('//', '/'), 'utf8'));
    });
    return raws.join('\n\n\n');
}

function retrieveFilesFromPathSync(path) {
    var rta = [];
    var files = readDirFiles.readSync(path);
    files = normalizeFilesTreePreservePath(files);
    Object.keys(files).sort().forEach(k => {
        rta.push({
            fileName: k,
            content: files[k]
        });
    });
    return rta;
}

function concatenateAllFilesFrom(path, opt) {
    ensureDirectory(path);
    //console.log('concatenateAllFilesFrom:start');
    var files = readDirFiles.readSync(path);

    if (opt && opt.debug) {
        console.log('DEBUG:  utils concatenateAllFilesFrom readDirFiles', JSON.stringify(Object.keys(files)));
    }

    //console.log('concatenateAllFilesFrom:files:length:'+Object.keys(files).length);
    files = normalizeFilesTreePreservePath(files);
    //console.log('concatenateAllFilesFrom:files:length:'+Object.keys(files).length);
    var rta = '';


    if (opt && opt.debug) {
        console.log('DEBUG:  utils concatenateAllFilesFrom normalizeFilesTreePreservePath', JSON.stringify(Object.keys(files)));
    }

    Object.keys(files).sort().forEach(k => {
        //console.log('concat ',k);
        rta += files[k];
    });
    return rta;
}


function createFile(dest, content) {
    dest = dest.replaceAll('//', '/');
    var basedir = getPath(dest);
    var fileName = getFileName(dest);
    if (!content) content = '';
    //console.log('DEBUG: utils create file', basedir, fileName, content.length, ' characters');
    return sander.writeFile(basedir, fileName, content);
}

function copyFilesFromTo(FROM_PATH, DEST, opt) {
    var hasErrors = false;
    var rta = new Promise((resolve, error) => {
        opt = opt || {
            formatContentHandler: undefined,
            formatPathHandler: undefined
        }
        if (!fs.existsSync(FROM_PATH)) {
            //console.log('DEBUG:  utils copyFilesFromTo skip for', FROM_PATH);
            return resolve({
                ok: false
            });
        }
        var files = normalizeFilesTreePreservePath(readDirFiles.readSync(FROM_PATH));
        var folders = getPaths(files);
        folders = folders.map(v => DEST + '/' + v);

        //console.log('DEBUG: utils copy files len', Object.keys(files).length);

        var _wait = cbHell(Object.keys(files).length, function() {
            resolve({
                ok: !hasErrors
            });
        });
        var path, rawContent, compiledContent, fullpath;
        // console.log('ss debug copyFilesFromTo prepare-to-copy ',Object.keys(files).length,'files');
        Object.keys(files).forEach(k => {
            path = k;
            rawContent = files[k];
            if (opt.formatPathHandler) {
                path = opt.formatPathHandler(path);
            }
            if (opt.formatContentHandler) {
                try {
                    compiledContent = opt.formatContentHandler(rawContent, path);
                }
                catch (e) {
                    //console.log('DEBUG: utils copyFilesFromTo write error', e);
                    hasErrors = true;
                }
            }
            else {
                compiledContent = rawContent;
            }
            fullpath = DEST + '/' + path;
            sander.writeFile(getPath(fullpath), getFileName(fullpath), compiledContent).then(() => {
                //console.log('ss debug copyFilesFromTo write success');
                _wait.add();
            });
            //console.log('he utils generating file ',fullpath);
        });
    });
    return rta;
}

//waits to success N basic async operations to procced.
function cbHell(quantity, cb) {
    //if(quantity==0) cb();
    return {
        call: () => cb(),
        add: () => {
            quantity--;
            if (quantity === 0) cb();
        }
    }
}

function filesIncludeOnly(filesObj, exts) {
    var rta = {},
        v, split;
    Object.keys(filesObj).forEach(k => {
        v = filesObj[k];
        split = k.split('.');
        if (split.length == 1) return;
        if (split.some(ext => ext == split[split.length - 1])) {
            rta[k] = v;
        }
    });
    return rta;
}

function normalizeFilesTree(files, rta) {
    rta = rta || {};
    var v, keys = Object.keys(files);
    keys.forEach(k => {
        v = files[k];
        if (v instanceof Buffer) {
            rta[k] = v.toString();
        }
        else {
            rta = normalizeFilesTree(v, rta);
        }
    });
    return rta;
}


function getPath(str) {
    var index = str.lastIndexOf('/');
    if (index === -1) return str;
    return str.substring(0, index)
}

function getFileName(str) {
    var index = str.lastIndexOf('/');
    if (index === -1) return str;
    return str.substring(index + 1);
}

function getPaths(obj) {
    var rta = [],
        index;
    Object.keys(obj).forEach(n => { //ex: n = aboutus/index.aboutus.html | RTA = aboutus/
        index = n.lastIndexOf('/');
        if (index === -1) return;
        rta.push(n.substring(0, index));
    });
    return rta;
}

function normalizeFilesTreePreservePath(files, rta, path) {
    if (Object.keys(files).length == 0) return {};
    //console.log('normalizeFilesTreePreservePath:files:len:',Object.keys(files));
    rta = rta || {};
    var v, keys = Object.keys(files),
        idCounter = 0;
    //console.log('normalizeFilesTreePreservePath:keys:length:',keys.length);



    keys.forEach(k => {
        v = files[k];
        //console.log(v instanceof Buffer,k);
        if (v instanceof Buffer) {

            idCounter++;
            //console.log('get ' + '#' + idCounter, path, k, v.toString().length);

            rta[(path || '') + k] = v.toString();
        }
        else {
            Object.assign(rta, normalizeFilesTreePreservePath(v, rta, (path || '') + k + '/'));
        }
    });


    return rta;
}

function getAbsolutePathFromCWD() {
  var dir = process.cwd();
  var pathArgs = [dir].concat(Array.prototype.splice.call(arguments, 0));
  return path.join.apply(path, pathArgs);
};

function watchHelper(PATH, CB) {
    /*
    console.log('GLOBAL-WATCH ',getAbsolutePathFromCWD(PATH));

    var _watch = new Watch({
        root: PATH,
        interval:500
    });
    _watch.on('create', function(o) {
        console.log("FS-WATCH CREATE: " + o.path + (o.dir === true ? ' [DIR]' : ''));
    });
    _watch.on('watching', function(o) {
        console.log("FS-WATCH Watching: " + o.path + (o.dir === true ? ' [DIR]' : ''));
    });
    _watch.on('change', function(o) {
        console.log("FS-WATCH Change: " + o.path + (o.dir === true ? ' [DIR]' : ''));
    });
    _watch.on('delete', function(o) {
        console.log("FS-WATCHDelete: " + o.path + (o.dir === true ? ' [DIR]' : ''));
    });

    _watch.on('error', function(err) {
        console.log("FS-WATCH Error: " ,err);
    });
    
    _watch.start();
*/

    //if (typeof PATH !== 'string') {
    return gwatch(PATH, CB);
    //}
    if (!fs.existsSync(PATH)) return console.log('LOG utils watch skip for', PATH);
    watch.watchTree(PATH, function(f, curr, prev) {
        var k = f;
        if (typeof f == "object" && prev === null && curr === null) {
            CB();
        }
        else if (prev === null) { // f is a new file
            CB();
        }
        else if (curr.nlink === 0) { // f was removed
            CB();
        }
        else { // f was changed
            CB();
            //console.log('changed', k);
        }
    });
}
