var express = require('express');
var bodyParser = require('body-parser')
var busboy = require('connect-busboy');
var path = require("path");
var inspect = require('util').inspect;
var fs = require('fs');
var port = process.env.PORT || 5000;
var LOCAL = process.env.LOCAL && process.env.LOCAL.toString() == '1' || false;
var apiMessage = null;
var https = require('https');
var http = require('http');
var backendAppName = process.env.APP_NAME || 'bastack';
const Promise = require('./model/utils').promise;

function configure(app) {
    return Promise(function(resolve, reject, emit) {
        app.all('*', function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            if ('OPTIONS' == req.method) {
                return res.send(200);
            }
            next();
        });
        var config = JSON.parse(fs.readFileSync(process.cwd() + '/package.json'));
        apiMessage = backendAppName + ' running version ' + config.version + '!';
        require('./model/backend-database');
        var configureRoutes = require('./model/backend-routes').configure;
        var configureProgrammedTasks = require('./model/tasks').configure;
        app.use(bodyParser.urlencoded({
            extended: true
        }))
        app.use(bodyParser.json());
        app.get('/api', function(req, res) {
            res.json({
                messsage: apiMessage,
                support: config.author
            });
        });
        configureRoutes(app).then(() => {

            //DIRS
            var ensureDirectory = (path) => {
                if (!fs.existsSync(path))
                    fs.mkdirSync(path);
            }
            var tempFolderPath = process.env.tempFolderPath || '/backend/temp/';
            ensureDirectory(process.cwd() + tempFolderPath);
            configureProgrammedTasks(app);

            resolve();
        });
    });
}
exports.configure = configure;
