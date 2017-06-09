var db = require('./backend-database');
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var stringToSnakeCaseMiddle = resolver.getFacade('str').stringToSnakeCaseMiddle;
var convertSnakeCaseMiddleToCamelCase = resolver.getFacade('str').convertSnakeCaseMiddleToCamelCase;

var replaceAll = resolver.getFacade('str').replaceAll;
var fs = require('fs');
var state = {
    controllers: {}
};
var EXPORT = {
    configure: configure,
    getAll: () => state.controllers
};
module.exports = EXPORT;

var logger = resolver.logger().get("API", 'CONTROLLERS');
var responseLogger = resolver.logger().get("API", 'ROUTE/RESPONSE');

function configure() {
    return resolver.coWrap(function*() {
        yield configureInFolder("src/server/common/controllers");
        yield configureInFolder("src/server/implementations/" + resolver.env().APP_NAME + "/controllers");
        //app folder
        return resolver.Promise.resolve(true);
    })();
}

function configureInFolder(relativePath) {
    return resolver.coWrap(function*() {
        
        var exists = yield resolver.getFacade('fs').exists(path.join(process.cwd(), relativePath));
        if (!exists) {
            logger.warnTerminal(path.join(process.cwd(), relativePath), ' should exist.');
            return resolver.Promise.resolve(true);
        }
        
        var filenames = yield resolver.getFacade('fs').readDirFiles.list(path.join(process.cwd(), relativePath));
        var fullPath = '';
        var filePath = '';
        for (var x in filenames) {
            filePath = filenames[x];
            fullPath = filePath;
            filePath = filePath.substring(filePath.lastIndexOf('/') + 1).replace('.js', '');
            if (filePath.indexOf('ignore') != -1) continue;
            if (!filePath) continue;
            register(filePath, fullPath);
        }
        return resolver.Promise.resolve(true);
    })();
}

function normalizeControllerName(name) {
    name = stringToSnakeCaseMiddle(name);
    name = replaceAll(name, '-controller', '');
    return convertSnakeCaseMiddleToCamelCase(name);
}

function registerController(name, actions) {
    logger.debugTerminal('Register', normalizeControllerName(name));
    state.controllers[normalizeControllerName(name)] = actions;
}

function isControllerRegistered(name) {
    return state.controllers[normalizeControllerName(name)] !== undefined;
}

function register(controllerName, fullPath) {
    if (isControllerRegistered(controllerName)) return;
    controllerName = normalizeControllerName(controllerName);
    registerController(controllerName, require(fullPath));
}
