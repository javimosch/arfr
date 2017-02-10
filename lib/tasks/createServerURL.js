var argv = require('yargs').argv;
var path = require('path');
var heUtils = require(path.join(process.cwd(),'/lib/core/utils'));

console.log(JSON.stringify(Object.keys(argv)));