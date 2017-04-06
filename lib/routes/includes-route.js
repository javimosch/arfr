var path = require("path");
var resolver = require(path.join(process.cwd(),'lib/resolver'));
var sander = require('sander');
var heTemplates = resolver.generatorTemplates();
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var Handlebars = require('handlebars');
function logger() {
    return resolver.logger().get('SERVER', 'ROUTES');
}
const APP_NAME = resolver.env().APP_NAME;
module.exports = {
    bind: (app,express) => {
        var files = sander.readdirSync(path.join(process.cwd(), 'src', APP_NAME, 'res'));
        for (var x in files) {
            if (files[x] == 'includes') {
                app.get('/includes/*', function(req, res, next) {
                    logger().debug('FS READ INCLUDE FETCH', req.url);
                    sander.readFile(path.join(process.cwd(), 'src', APP_NAME, 'res', req.url), {
                        encoding: 'utf-8'
                    }).then((str) => {
                        logger().debug('INCLUDE COMPILING',req.url, str.length);
                        str = Handlebars.compile(str)(resolver.handlebarsContext());
                        logger().debug('INCLUDE COMPILED AND SENDED', str.length);
                        res.send(str);
                    });


                });
            }
        }
        files.forEach(n => {
            if (n == 'includes') return;
            var _path = path.join(process.cwd(), 'src', APP_NAME, 'res', n);
            app.use('/' + n, express.static(_path));
            
            resolver.routes().logger().debug('STATIC ROUTE EXPOSED', '/' + n);
        });
    }
};
