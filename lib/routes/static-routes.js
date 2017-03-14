var sander = require('sander');
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
module.exports = {
    bind: (app, express) => {
        var APP_NAME = resolver.env().APP_NAME;
        var DEST = resolver.env().DEST;
        var files = sander.readdirSync(path.join(process.cwd(), 'src', APP_NAME, 'static'));
        files.forEach(directoryName => {
            if (directoryName != 'app') {
                resolver.routes().logger().debug('STATIC','/' + directoryName);
                app.use('/' + directoryName, express.static(path.join(process.cwd(), DEST, directoryName)));
            }
        });
    }
}
