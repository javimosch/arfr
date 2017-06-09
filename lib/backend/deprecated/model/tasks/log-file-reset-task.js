var filesize = require('file-size');
var sander = require('sander');
var fs = require('fs');
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var name = 'log-file-reset'
var logger = resolver.logger().get('SERVER', 'TASK-' + name.toUpperCase());
module.exports = {
    name: name,
    interval: 1000 * 60 * 10, //each minutes
    handler: handler,
    startupInterval: true,
    //startupIntervalDelay: 1000,
};

function handler() {
    sander.fstat(sander.openSync(path.join(process.cwd(), 'log.txt'), 'r')).then(res => {
        var sizeInMb = filesize(res.size).to('MB');
        var _path = path.join(process.cwd(), 'log.txt');
        var fileController = resolver.ctrl().file;
        if (sizeInMb > 5) {
            fileController.uploadFromFileSystem({
                path: _path,
                filename: 'log.txt'
            }).then(file => {
                resetLogFile(_path);
                logger.debugSave('Log file written to database and reseted', file);
            });
        }
        else {
            logger.debugTerminal('Log file is < 5mb, reset ignore.')
        }
    }).catch(err => {
        logger.error('Stat', err);
    });
}

function resetLogFile(filePath) {
    sander.unlink(filePath).then(() => {
        sander.writeFileSync(filePath, '', {
            encoding: 'utf-8'
        });
    }).catch(err => {
        logger.error(err);
    });
}
