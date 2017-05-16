var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var logger = resolver.logger().get('ROUTER', 'CTRL-ACTION');
module.exports = {
    handleControllerAction: handleControllerAction
};

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
            logger.errorTerminal('dataAsString', err, str);
        }
    }

    var actions = resolver.ctrl()[controller] || null;
    if (!actions) {
        logger.errorTerminal('Invalid controller', controller);
        var cb = actions.result(res);
        return cb(['Invalid controller', controller].join(''));
    }

    var promise;

    if (!actions[action]) {
        logger.errorTerminal('Invalid action', controller, action);
        var cb = actions.result(res);
        return cb(['Invalid action', controller, action].join(' '));
    }

    actions[action](data, createResultCallback(res, controller + '/' + action), req, res);

}

function createResultCallback(res, name) {
    return function(err, r) {
        if (typeof err == 'string' ||
            (Object.keys(err || {}).length == 0 && err != undefined)) {
            err = {
                message: err.toString()
            };
        }
        var rta = {
            ok: !err,
            message: (err) ? 'Error' : 'Success',
            err: err || null,
            result: (r !== null) ? r : ((r === false) ? false : null)
        };
        if (!rta.ok) {
            logger.warn(name, err);
        }
        else {
            logger.debugTerminal(name, rta.result);
        }
        if (rta.result && rta.result.result) {
            if (rta.result.message) {
                rta.message = rta.result.message;
                rta.result = rta.result.result;
            }
        }

        res.json(rta);

    };
}
