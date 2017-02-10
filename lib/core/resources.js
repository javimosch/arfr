var heUtils = require('./utils');
var heConfig = require('../config');
var heFirebase = require('./firebase');
module.exports = {
    watch: () => {
        var path = process.cwd() + '/src/'+heConfig().appName+'/res';
        console.log('DEBUG: RES watch at', path);
        heUtils.watch(path, () => {
            heFirebase.sendSignal('reload')
        });
    }
};
