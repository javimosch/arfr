var controllers = require('../model/backend-controllers-manager');
var atob = require('atob');
var Logger = controllers.logs.createLogger({
    name: "API",
    category: "CSS"
});

//var coreUtils = require(process.cwd()+'/lib/core/utils');

var fs = require('fs');
var path = require('path');
var sander = require('sander');
var cssbeautify = require('cssbeautify');

module.exports = {
    saveLocalFile: saveLocalFile
};

function saveLocalFile(data, cb) {

    if (fs.existsSync(path.join(process.cwd(), 'src', data.appName, 'css', data.fileName))) {
        var result = atob(data.encoded);
        result = cssbeautify(result);
        sander.writeFile(path.join(process.cwd(), 'src', data.appName, 'css'), data.fileName, result).then(res => {

            //Logger.debug('SAVE RESULT ', res);

            Logger.debug('SAVING CSS', {
                fileName: data.fileName,
                appName: data.appName,
                exists: fs.existsSync(path.join(process.cwd(), 'src', data.appName, 'css', data.fileName)),
                content: atob(data.encoded)
            });

            return cb(null, 'Saved!');


        });
    }





}
