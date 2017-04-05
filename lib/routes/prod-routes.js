var PROD = process.env.PROD && process.env.PROD.toString() == '1' || false;
var path = require("path");
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
const APP_NAME = resolver.env().APP_NAME;
module.exports = {
    bind: (app, express) => {
        if (PROD) {
            app.use('/css', express.static(path.join(process.cwd(), resolver.env().DEST, 'css')));
            app.use('/js', express.static(path.join(process.cwd(), resolver.env().DEST, 'js')));
        }
    }
}
