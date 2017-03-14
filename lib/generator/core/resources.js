var heUtils = require('./utils');
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var heFirebase = require('./firebase');
module.exports = {
    watch: () => {
        var logger = resolver.logger().get('SERVER', 'GENERATOR-RES');
        var path = process.cwd() + '/src/' + resolver.env().APP_NAME + '/res';
        logger.debug('RES watch at', path);
        heUtils.watch(path, () => {
            heFirebase.sendSignal('reload')
        });
    }
};
