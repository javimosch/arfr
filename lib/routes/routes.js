var path = require('path');
var resolver = require(path.join(process.cwd(),'lib/resolver'));

function logger() {
    return resolver.logger().get('SERVER', 'ROUTES');
}
module.exports = {
    logger: logger,
    configure: (app, express) => resolver.coWrap(function*(app,express){
        logger().debugTerminal('Loading Api info');
        require('./api-information-route').bind(app, express);
        logger().debugTerminal('Loading Vendor');
        require('./vendor-routes').bind(app, express);
        logger().debugTerminal('Loading Includes');
        yield require('./includes-route').bind(app, express);
        logger().debugTerminal('Loading Dev');
        require('./dev-routes').bind(app, express);
        logger().debugTerminal('Loading Prod');
        require('./prod-routes').bind(app, express);
        logger().debugTerminal('Loading Static');
        yield require('./static-routes').bind(app, express);
        logger().debugTerminal('Loading Single');
        require('./single-app-routes').bind(app, express);
        return resolver.Promise.resolve(true);
    })(app,express)
};
