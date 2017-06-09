var Promise = require('promise');

var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));

//upload feature
var multer = require('multer')
var multer_upload = multer({
    dest: path.join(process.cwd(), 'backend', 'temp')
});

var Logger, NOTIFICATION, File;

exports.configure = function(app) {
    return new Promise(function(resolve, reject, emit) {
        var controllers = require('./backend-controllers-manager');
        var logger = resolver.logger().get('SERVER', 'BACKEND-ROUTES');

        logger.debugTerminal('Creating handler for /api/:controller/:action');
        app.post('/ctrl/:controller/:action', handleControllerAction);
        app.post('/api/:controller/:action', handleControllerAction);


        /*https://www.npmjs.com/package/multer*/
        var singleFn = multer_upload.fields([{
            name: 'file',
            maxCount: 1
        }]);
        app.post('/api/:controller/:action/multer_single', singleFn, function(req, res, next) {
            Logger.debugTerminal('multer_single ', req.params.controller, req.params.action);
            //Logger.debugTerminal('multer_single ',Object.keys(req.files.file));

            handleControllerAction(req, res);
        });



        function handleControllerAction(req, res) {
            var controller = req.params.controller;
            var action = req.params.action;
            var data = req.body;

            if (data.dataAsString) {
                //Remove commas (begin, end)
                var str = (data.dataAsString.indexOf('"') == 0) ? (data.dataAsString.slice(1).substring(0, data.dataAsString.length - 2)) : data.dataAsString;
                try {
                    data = JSON.parse(str);
                }
                catch (err) {
                    Logger.error('dataAsString', err, str);
                }
            }

            var actions = controllers[controllers._normalizeControllerName(controller)];
            if (!actions) {
                Logger.error('Invalid controller', controller);
                var cb = actions.result(res);
                return cb(['Invalid controller', controller].join(''));
            }

            var promise;

            if (!actions[action] && (!actions.model || !actions.model[action])) {
                Logger.error('Invalid action', controller, action);
                var cb = actions.result(res);
                return cb(['Invalid action', controller, action].join(' '));
            }
            if (actions[action]) {
                promise = actions[action](data, actions.result(res), req, res);
            }
            else {
                console.log('routes:ctrl:model-calling', action);
                promise = actions.model[action](actions.toRules(data), actions.result(res), req, res);
            }

            if (promise && promise.then) {
                //promise.then(actions.result(res));
            }
        }



        app.post('/File/save/', (req, res) => {
            File.save({}, File.result(res), req, res);
        });

        app.get('/File/get/:_id', (req, res) => {
            File.get({
                _id: req.params._id
            }, (err, data) => {
                if (err) {
                    return res.json(err);
                }
                res.setHeader("content-type", "application/pdf");
                res.setHeader('Content-disposition', ' filename=' + (data.filename || 'file') + '.pdf');

                data.stream.pipe(res);
            });
        });


        Logger = controllers.logs.createLogger({
            name: "API",
            category: "ROUTER"
        });
        NOTIFICATION = controllers.notification.NOTIFICATION;
        File = controllers.file;
        
        
        logger.debugTerminal('OK');
        resolve();
    });

};
