var path = require('path');
var resolver = require(path.join(process.cwd(),'lib/resolver'));

function logger() {
    return resolver.logger().get('SERVER', 'ROUTES');
}
module.exports = {
    logger: logger,
    configure: (app, express) => {
        logger().debug('Loading Api info');
        require('./api-information-route').bind(app, express);
        logger().debug('Loading Vendor');
        require('./vendor-routes').bind(app, express);
        logger().debug('Loading Includes');
        require('./includes-route').bind(app, express);
        logger().debug('Loading Dev');
        require('./dev-routes').bind(app, express);
        logger().debug('Loading Prod');
        require('./prod-routes').bind(app, express);
        logger().debug('Loading Static');
        require('./static-routes').bind(app, express);
        logger().debug('Loading Single');
        require('./single-app-routes').bind(app, express);
    }
};
