var path = require('path');
var resolver = require(path.join(process.cwd(),'lib/resolver'));
var fs = require('fs');
module.exports = {
    bind: app => {
        var backendAppName = resolver.env().APP_NAME || 'bastack';
        var config = JSON.parse(fs.readFileSync(process.cwd() + '/package.json'));
        var apiMessage = backendAppName + ' running version ' + config.version + '!';
        app.get('/api', function(req, res) {
            res.json({
                messsage: apiMessage,
                support: config.author
            });
        });
    }
};
