var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var logger = resolver.logger().get('ROUTES', "SINGLE-APP");
module.exports = {
    bind: (app) => {

        var heConfig = resolver.handlebarsContext();
        if (heConfig.use(resolver.env().APP_NAME).i18n_config) {
            var langs = heConfig.use(resolver.env().APP_NAME).i18n_config.languages;
            if (langs && langs.length > 0 && (resolver.env().PROD || resolver.env().MULTILANG)) {
                langs.forEach(langCode => {
                    app.get('/' + langCode + '/*', function(req, res, next) {
                        console.log('APP /' + langCode);
                        res.sendFile('/' + langCode + '/app/index.html', {
                            root: path.join(process.cwd(), resolver.env().DEST)
                        });
                    });
                    console.log('SERVER: SET ROUTE FOR LANGUAGE', langCode);
                });
            }
        }

        var angularEntryPath = path.join(process.cwd(), resolver.env().DEST, 'app/index.html');
        var angularEntryExists = resolver.getFacade('fs').existsSync(angularEntryPath);
        if (!angularEntryExists && resolver.env().APP_ROUTING) {
            logger.warnTerminal('Angular routing is enabled but there is not file at', angularEntryPath);
        }

        if (angularEntryExists && resolver.env().APP_ROUTING) {
            resolver.routes().logger().debugTerminal('APP_ROUTING enabled');
            //redirect everything else to angular root

            resolver.co(function*() {
                //yield resolveRoot(app);
                app.get('/*', function(req, res, next) {
                    res.sendFile('/app/index.html', {
                        root: path.join(process.cwd(), resolver.env().DEST)
                    });
                });
            }).catch(resolver.routes().logger().errorTerminal);

        }
        else {
            app.get('/', function(req, res, next) {
                res.sendFile('/index.html', {
                    root: path.join(process.cwd(), resolver.env().DEST)
                });
            });
            resolver.routes().logger().debugTerminal('APP_ROUTING disabled');
        }


    }
};


function resolveRoot(app) {
    return resolver.coWrapExec(function*() {
        //There is a file who contains 'index' inside static folder
        var arr = yield resolver.getFacade('fs').readdir(resolver.clientFolder('static'));
        var index = arr.filter(n => n.indexOf('index') !== -1);
        index = index.length > 0 && index[0] || null;
        if (index) {
            index = index.indexOf('.') !== -1 ? index.substring(0, index.indexOf('.')) + '.html' : index;
            setRoot(app, index);
        }
        else {
            var rootFolder = arr.filter(n => n.indexOf('root') === 0);
            rootFolder = rootFolder.length > 0 && rootFolder[0];
            if (rootFolder) {
                setRoot(app, 'root/index.html');
            }
            else {
                resolver.routes().logger().warnTerminal('Static should contain an index file or root/index');
            }
        }
        resolver.routes().logger().debugTerminal('resolveRoot');
    });
}

function setRoot(app, relativePath) {
    resolver.routes().logger().debugTerminal('setRoot', relativePath);
    app.get('/', function(req, res, next) {
        res.sendFile('/' + relativePath, {
            root: path.join(process.cwd(), resolver.env().DEST)
        });
    });
}
