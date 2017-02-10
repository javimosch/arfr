var path = require('path');
var utils = require(path.join(process.cwd(),'/lib/core/utils'));
var fs = require('fs');
require('dotenv').config();
var config = {
    API_ENDPOINT: process.env.API_ENDPOINT || 'http://shopmycourses.herokuapp.com/',
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '979481548722-mj63ev1utfe9v21l5pdiv4j0t1v7jhl2.apps.googleusercontent.com',
    TEST: 1
};

utils.ensureDirectory(path.join(process.cwd(), 'dist-production'));
utils.ensureDirectory(path.join(process.cwd(), 'dist-production', 'files'));

console.log('Config.json expected',JSON.stringify(config));


fs.writeFileSync(path.join(process.cwd(), 'dist-production', 'files', 'config.json'), JSON.stringify(config), 'utf8');
fs.writeFileSync(path.join(process.cwd(), 'dist-production', 'files', 'config2.json'), JSON.stringify(config), 'utf8');

console.log('Config.json generated.');
//console.log(JSON.stringify(config));
process.exit(0);