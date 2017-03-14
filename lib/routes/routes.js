var path = require('path');
var resolver = require(path.join(process.cwd(),'lib/resolver'));

function logger() {
    return resolver.logger().get('SERVER', 'ROUTES');
}
module.exports = {
    logger: logger,
    configure: (app, express) => {
        require('./api-information-route').bind(app, express);
        require('./vendor-routes').bind(app, express);
        require('./includes-route').bind(app, express);
        require('./dev-routes').bind(app, express);
        require('./static-routes').bind(app, express);
        require('./single-app-routes').bind(app, express);
    }
};
