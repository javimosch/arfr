var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var controllers = require('../model/backend-controllers-manager');
var atob = require('atob');
var Logger = resolver.logger().get('API','CSS');
var fs = require('fs');
var sander = require('sander');
var cssbeautify = require('cssbeautify');

module.exports = {
    saveLocalFile: saveLocalFile
};

function saveLocalFile(data, cb) {
    
    data.appName = data.appName || resolver.env().APP_NAME;
    
    Logger.debug('Using appName ',data.appName);

    if (fs.existsSync(path.join(process.cwd(), 'src', data.appName, 'css', data.fileName))) {
        var result = atob(data.encoded);
        result = cssbeautify(result);

        Logger.debug('SAVING'/*, {
            fileName: data.fileName,
            appName: data.appName,
            where: path.join(process.cwd(), 'src', data.appName, 'css')
        }*/);

        sander.writeFile(path.join(process.cwd(), 'src', data.appName, 'css'), data.fileName, result).then(res => {
            Logger.debug('SAVED'/*, {
                fileName: data.fileName,
                appName: data.appName,
                exists: fs.existsSync(path.join(process.cwd(), 'src', data.appName, 'css', data.fileName)),
                content: atob(data.encoded)
            }*/);
            return cb(null, 'Saved!');
        });
    }else{
        Logger.warn('The file do not exists', {
            path: path.join(process.cwd(), 'src', data.appName, 'css', data.fileName)
        });
    }





}
