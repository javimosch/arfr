require('dotenv').config({
    silent: true,
    path: process.cwd() + '/.env'
});
const PROD = process.env.PROD && process.env.PROD.toString() == '1' || false;
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var self = {
    PROD: PROD,
    HOT_MAQUETTE:process.env.HOT_MAQUETTE && process.env.HOT_MAQUETTE.toString() == '1' || false,
    MULTILANG: process.env.MULTILANG && process.env.MULTILANG.toString() == '1' || false,
    ROLLUP: process.env.ROLLUP && process.env.ROLLUP.toString() == '1' || false,
    APP_NAME: process.env.APP,
    APP_ROUTING: process.env.APP_ROUTING && process.env.APP_ROUTING.toString() == '1' || false,
    PORT: process.env.PORT || 3000,
    DEST: PROD ? 'dist-production' : 'dist'
};
Object.assign(self,require(path.join(process.cwd(), 'src/server/envs')));
module.exports = self;
