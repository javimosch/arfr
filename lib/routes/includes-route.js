var path = require("path");
var resolver = require(path.join(process.cwd(),'lib/resolver'));
var sander = require('sander');
var heTemplates = resolver.generatorTemplates();
const APP_NAME = process.env.APP;
module.exports = {
    bind: (app,express) => {
        var files = sander.readdirSync(path.join(process.cwd(), 'src', APP_NAME, 'res'));
        for (var x in files) {
            if (files[x] == 'includes') {
                app.get('/includes/*', function(req, res, next) {
                    console.log('SERVER SENDING INCLUDE FETCH', req.url);
                    sander.readFile(path.join(process.cwd(), 'src', APP_NAME, 'res', req.url), {
                        encoding: 'utf-8'
                    }).then((str) => {
                        console.log('SERVER SENDING INCLUDE FETCH SUCCESS', str.length);
                        str = heTemplates.compile(str);
                        console.log('SERVER SENDING INCLUDE FETCH SUCCESS AND COMPILED', str.length);
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
