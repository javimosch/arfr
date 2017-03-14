var PROD = process.env.PROD && process.env.PROD.toString() == '1' || false;
var path = require("path");
const APP_NAME = process.env.APP;
module.exports = {
    bind: (app, express) => {
        if (!PROD) {
            app.use('/common', express.static(path.join(process.cwd(), 'src/common')));
            app.use('/raw/css', express.static(path.join(process.cwd(), 'src', APP_NAME, 'css')));
            app.use('/raw/js', express.static(path.join(process.cwd(), 'src', APP_NAME, 'js')));
        }
    }
}
