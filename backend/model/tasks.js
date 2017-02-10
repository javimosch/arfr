var req         = (n) => require('./tasks/'+n);
var tasks = [
    //req('task.diplomeExpiration'),
    //req('task.deleteTemporalFiles'),
    //req('task.diags-remove-unpaid-orders'),
    //req('task.mongoritoTest')
];
exports.configure = (app) => {
    tasks.forEach((t) => {
        function loop() {
            console.log('task-manager:start: ' + t.name);
            try {
                t.handler(t, app);
            }
            catch (e) {
                console.log('task-manager-exception', e);
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
