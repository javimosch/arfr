var path = require("path");
var resolver = require('./resolver');
var instances = {};
function exists(n, c) {
    return instances[n + '_' + c] !== undefined;
}
function get(n, c) {
    return instances[n + '_' + c];
}
function create(n, c) {
    var controllers = resolver.databaseControllers();
    var instance = controllers.logs.createLogger({
        name: n,
        category: c
    });
    instances[n + '_' + c] = instance;
    return instance;
}
module.exports = {
    get: (name, category) => {
        if (exists(name, category)) {
            return get(name, category);
        }
        else {
            return create(name, category);
        }
    }
}
