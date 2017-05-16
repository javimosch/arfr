var sander = require('sander');
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
module.exports = {
    bind: (app, express) => resolver.coWrap(function*(app, express) {
        var APP_NAME = resolver.env().APP_NAME;
        var DEST = resolver.env().DEST;
        var staticPath = resolver.pathTo(resolver.CONSTANT().SRC_CLIENT_PATH, path.join(APP_NAME, 'static'));
        var exists = yield resolver.getFacade('fs').exists(staticPath);
        if (exists) {
            var files = sander.readdirSync(staticPath);
            files.forEach(directoryName => {
                if (directoryName != 'app') {
                    resolver.routes().logger().debugTerminal('STATIC', '/' + directoryName);
                    app.use('/' + directoryName, express.static(path.join(process.cwd(), DEST, directoryName)));
                }
            });
        }
        else {
            resolver.logger().get('ROUTES', "STATIC").warnTerminal('static folder expected at ', staticPath);
        }
        return resolver.Promise.resolve(true);
    })(app, express)
}
