var path = require('path');
var Promise = require('promise');
var resolver = require('./resolver');
function logger() {
    return resolver.logger().get('SERVER', 'DATABASE');
}
module.exports = {
    logger: logger,
    configure: () => {
        return new Promise((resolve, reject) => {
            resolver.backendDatabase().initialize().then(() => {
                var controllers = resolver.databaseControllers();
                controllers._markAsSchemeless(['email', 'stats', 'css', 'file', 'image']);
                controllers._start().then(function() {
                    logger().debug('CONTROLLERS:OK');
                    resolve();
                });
            }).catch(reject);
        });
    }
}
