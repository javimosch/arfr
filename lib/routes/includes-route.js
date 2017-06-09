var path = require("path");
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var sander = require('sander');
var heTemplates = resolver.generatorTemplates();
var Handlebars = require('handlebars');

function logger() {
    return resolver.logger().get('ROUTES', 'INCLUDES');
}

function handleError(err, req, res) {
    logger().errorTerminal(err);
    res.send('Include error (' + req.url + ')');
}
const APP_NAME = resolver.env().APP_NAME;
module.exports = {
    bind: (app, express) => resolver.coWrap(function*(app, express) {
        var resPath = resolver.pathTo(resolver.CONSTANT().SRC_CLIENT_PATH, path.join(APP_NAME, 'res'))
        var exists = yield resolver.getFacade('fs').exists(resPath);
        if (exists) {
            var files = sander.readdirSync(resPath);
            for (var x in files) {
                if (files[x] == 'includes') {
                    app.get('/includes/*', function(req, res, next) {
                        var filePath = resolver.clientFolder('res', req.url);
                        resolver.co(function*() {
                            var exists = yield resolver.getFacade('fs').exists(filePath);
                            if (!exists) {
                                return handleError('Not found:' + req.url, req, res);
                            }
                            logger().debugTerminal('FS READ INCLUDE FETCH', req.url);
                            var str = yield sander.readFile(filePath, {
                                encoding: 'utf-8'
                            });
                            logger().debugTerminal('INCLUDE COMPILING', req.url, str.length);
                            str = Handlebars.compile(str)(resolver.handlebarsContext());
                            logger().debugTerminal('INCLUDE COMPILED AND SENDED', str.length);
                            res.send(str);
                        }).catch((err) => handleError(err, req, res));
                    });
                }
            }
            files.forEach(n => {
                if (n == 'includes') return;
                var _path = path.join(process.cwd(), resolver.CONSTANT().SRC_CLIENT_PATH, APP_NAME, 'res', n);
                app.use('/' + n, express.static(_path));

                resolver.routes().logger().debugTerminal('STATIC ROUTE EXPOSED', '/' + n, _path);
            });
        }
        else {
            logger().warnTerminal('res folder expected at ', resPath);
        }
        return resolver.Promise.resolve(true);
    })(app, express)
};
