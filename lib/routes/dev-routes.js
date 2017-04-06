var PROD = process.env.PROD && process.env.PROD.toString() == '1' || false;
var path = require("path");
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
function logger() {
    return resolver.logger().get('SERVER', 'ROUTES');
}
const APP_NAME = resolver.env().APP_NAME;
module.exports = {
    bind: (app, express) => {
        if (!PROD) {
            app.use('/common', express.static(path.join(process.cwd(), 'src/common')));
            app.use('/raw/css', express.static(path.join(process.cwd(), 'src', APP_NAME, 'css')));
            app.use('/raw/js', express.static(path.join(process.cwd(), 'src', APP_NAME, 'js')));
        }
    }
}
