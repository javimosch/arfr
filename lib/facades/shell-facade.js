var shell = require('shelljs');
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var logger = resolver.logger().get('FACADE', 'SHELL');
module.exports = {
    execLongProcess: function(command) {
        var child = shell.exec(command, {
            async: true
        });
        child.stdout.on('data', function(data) {
            logger.debugTerminal(data);
        });
    }
}
