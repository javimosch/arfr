require('dotenv').config({
    silent: true,
    path: process.cwd() + '/.env'
});
module.exports = {
    PROD: process.env.PROD && process.env.PROD.toString() == '1' || false,
    MULTILANG: process.env.MULTILANG && process.env.MULTILANG.toString() == '1' || false,
    APP_NAME: process.env.APP,
    APP_ROUTING: process.env.APP_ROUTING && process.env.APP_ROUTING.toString() == '1' || false,
    PORT: process.env.PORT || 3000,
    DEST: 'dist'
};
