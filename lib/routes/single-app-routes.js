var path = require('path');
var resolver = require(path.join(process.cwd(),'lib/resolver'));
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
        //redirect everything else to angular root
        app.get('/*', function(req, res, next) {
            console.log('APP /');
            res.sendFile('/app/index.html', {
                root: path.join(process.cwd(), resolver.env().DEST)
            });
        });
    }
};
