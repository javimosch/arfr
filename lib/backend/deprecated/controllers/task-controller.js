"use strict"
var shortid = require('shortid');
var ctrl = require('../model/backend-controllers-manager').create;
var preserveKeys = require('../model/utils').preserveKeys;
var hasRequiredKeys = require('../model/utils').hasRequiredKeys;


module.exports = {
    saveTask: saveTask
}

function saveTask(data, cb) {
    if (!data.code) {
        data.code = shortid.generate();
    }
    if (!hasRequiredKeys(data, ['code', 'short_description','number'], (key) => cb({
            message: key + ' required',
            payload: data
        }))) {
        return;
    }

    if (data.code) {
        //if only code was provide
        data.__match = {
            code: data.code
        };
    }

    if (data.number) {
        data.__match = {
            _project: data._project._id,
            number: data.number
        };
    }

    //preserveKeys(data, ['code', 'short_description', 'description', '_project']);
    ctrl('task').save(data, cb);
}
