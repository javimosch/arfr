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

    var resolveReq = createResultCallback(res, controller + '/' + action);

    var actions = resolver.ctrl()[controller] || null;
    if (!actions) {
        logger.errorTerminal('Invalid controller', controller);
        return resolveReq(['Invalid controller', controller].join(' '));
    }


    if (!actions[action]) {
        logger.errorTerminal('Invalid action', controller, action);
        return resolveReq(['Invalid action', controller, action].join(' '));
    }


    var actionPromise = actions[action](data, req, res);
    if (!actionPromise || !actionPromise.then) {
        logger.errorTerminal('Promise expected, got', typeof actionPromise, controller, action);
        return resolveReq('Server implementation error');
    }
    else {
        actionPromise.then(r => resolveReq(null, r)).catch((err) => {
            //logger.errorTerminal(controller, action, err);
            resolveReq(err);
        });
    }
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
