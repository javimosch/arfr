var filesize = require('file-size');
var sander = require('sander');
var path = require('path');
var resolver = require(path.join(process.cwd(),'lib/resolver'));
var name = 'log-file-reset' 
module.exports = {
    name: name,
    interval: 1000 * 60 * 10, //each minutes
    handler: handler,
    startupInterval: true,
    //startupIntervalDelay: 1000,
};
function handler(){
    var logger = resolver.logger().get('SERVER','TASK-'+name.toUpperCase());
    logger.debug('Start');
}