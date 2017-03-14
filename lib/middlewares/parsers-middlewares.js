var bodyParser = require('body-parser')
//var busboy = require('connect-busboy');
module.exports = {
    bind: app => {
        app.use(bodyParser.urlencoded({
            extended: true
        }))
        app.use(bodyParser.json());
    }
};
