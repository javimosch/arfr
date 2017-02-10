var heUtils = require('./utils');
var heConfig = require('../config');
var heFirebase = require('./firebase');
module.exports = {
    watch: () => {
        var path = process.cwd() + '/src/common';
        console.log('DEBUG: common watch at', path);
        heUtils.watch(path, () => {
            heFirebase.sendSignal('reload', {
                full_reload: true
            })
        });
    }
};
