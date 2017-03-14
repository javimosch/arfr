var heUtils = require('./utils');
var path =require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var heConfig = resolver.handlebarsContext();
var heFirebase = require('./firebase');
module.exports = {
    watch: () => {
        var logger = resolver.logger().get('SERVER','GENERATOR-COMMON');
        var path = process.cwd() + '/src/common';
        logger.debug('common watch at', path);
        heUtils.watch(path, () => {
            heFirebase.sendSignal('reload', {
                full_reload: true
            })
        });
    }
};
