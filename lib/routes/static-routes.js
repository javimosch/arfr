var sander = require('sander');
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
module.exports = {
    bind: (app, express) => resolver.coWrap(function*(app, express) {
        var logger = resolver.logger().get('ROUTES', "STATIC");
        var APP_NAME = resolver.env().APP_NAME;
        var DEST = resolver.env().DEST;
        var staticPath = resolver.pathTo(resolver.CONSTANT().SRC_CLIENT_PATH, path.join(APP_NAME, 'static'));
        var exists = yield resolver.getFacade('fs').exists(staticPath);
        if (exists) {

            var arr = resolver.generatorUtils().getFilePathsTreeRecursive(staticPath).map(p => {
                return resolver.generatorTemplates().getCompiledPath(p);
            }).filter(p => p !== null);


            arr.forEach(relativePath => {
                if (relativePath.indexOf('app/index') !== -1) return;
                var route = '/';
                if (relativePath.indexOf('/') === -1) {

                }
                else {
                    route+= relativePath.substring(0, relativePath.lastIndexOf('/'));
                }

                resolver.routes().logger().debugTerminal('BIND', route);
                app.get(route, function(req, res, next) {
                    res.sendFile(relativePath, {
                        root: resolver.env().DEST
                    });
                });
            });

        }
        else {
            logger.warnTerminal('static folder expected at ', staticPath);
        }

        //app.use('/js', express.static(resolver.pathTo(resolver.CONSTANT().SRC_CLIENT_PATH, path.join(APP_NAME, 'js'))));
        ///app.use('/css', express.static(resolver.pathTo(resolver.CONSTANT().SRC_CLIENT_PATH, path.join(APP_NAME, 'css'))));

        app.get('/js/app.js', function(req, res, next) {
            res.sendFile('./app.js', {
                root: resolver.pathTo(DEST, 'js')
            });
        });
        app.get('/js/app.js.map', function(req, res, next) {
            res.sendFile('./app.js.map', {
                root: resolver.pathTo(DEST, 'js')
            });
        });

        return resolver.Promise.resolve(true);
    })(app, express)
}
