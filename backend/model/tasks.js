var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var req = (n) => require('./tasks/' + n);
var tasks = [
    //req('task.diplomeExpiration'),
    //req('task.deleteTemporalFiles'),
    //req('task.diags-remove-unpaid-orders'),
    //req('task.mongoritoTest')
    req('log-file-reset-task')
];
exports.configure = (app) => {
    var logger = resolver.logger().get('SERVER', 'TASK-MANAGER');
    tasks.forEach((t) => {
        function loop() {
            logger.debug('Running', t.name);
            try {
                t.handler(t, app);
            }
            catch (e) {
                logger.errorSave('Exception', e);
            }
        }
        setInterval(() => {
            loop
        }, t.interval);


        if (t.startupInterval) {
            loop();
        }
        else {
            if (t.startupIntervalDelay) {
                setTimeout(loop, t.startupIntervalDelay || 0);
            }
        }
    });
}
