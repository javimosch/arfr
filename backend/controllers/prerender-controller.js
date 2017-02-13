const path = require('path');
const controllers = require('../model/backend-controllers-manager');
const coreUtils = require(path.join(process.cwd(), 'lib', 'core', 'utils'));
const replaceAll = require('../model/utils').replaceAll;
const Promise = require('../model/utils').promise;
var sander = require('sander');

var Logger = controllers.logs.createLogger({
    name: "API",
    category: "PRERENDER"
});

module.exports = {
    savePrerender: savePrerender,
    write: write,
    exists: exists
};

function normalizeViewName(p){
    p = replaceAll(p, '/', '--');
    p = replaceAll(p, '.json', '');
    return p;
}

function getPath(fileName) {
    return path.join(process.cwd(), 'backend/prerendered-files', fileName);
}

function savePrerender(data, cb) {
    if (!data.path) return cb('path required');
    if (!data.content) return cb('content required');
    var appName = process.env.APP_NAME;
    if (!appName) return cb('configure APP_NAME');
    var payload = {
        appName: appName,
        name: normalizeViewName(data.path),
        content: data.content
    };
    Logger.debug('SAVE',payload);
    payload.__match = {
        appName: payload.appName,
        name: payload.name
    };

    controllers._co(function*() {
        var result = yield controllers.prerender.save(payload);
        cb(null, result);
    }, null, Logger);
}

function write(data, cb) {
    if (!data.path) return cb('path required');
    if (!data.content) return cb('content required');
    var appName = process.env.APP_NAME;
    if (!appName) return cb('configure APP_NAME');

    data.path = replaceAll(data.path, '/', '--');
    data.path = replaceAll(data.path, '.json', '') + '.json';
    const fullpath = getPath(data.path);
    return sander.writeFile(fullpath, JSON.stringify({
        appName: appName,
        name: data.path,
        created_at: Date.now(),
        content: data.content
    })).then(function(content) {
        cb(null, true);
    });
}



function exists(data, cb) {
    return Promise(function(resolve, error, emit) {
        data.path = replaceAll(data.path, '/', '--');
        data.path = replaceAll(data.path, '.json', '') + '.json';
        sander.exists(getPath(data.path)).then(rta => {
            resolve(rta);
            cb && cb(null, rta)
        });
    });
}
