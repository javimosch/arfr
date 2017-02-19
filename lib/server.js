"use strict";
require('dotenv').config({
	silent: true,
	path: process.cwd() + '/.env'
});
var express = require('express');
var path = require("path");
var app = express();
var http = require('http').Server(app);
var PROD = process.env.PROD && process.env.PROD.toString() == '1' || false;
var MULTILANG = process.env.MULTILANG && process.env.MULTILANG.toString() == '1' || false;
var port = process.env.PORT || 3000;
var config = require('./config.js').multipleConfig;
var btoa = require('btoa');
var fs = require('fs');
var sander = require('sander');
var dest = 'dist';
const APP_NAME = process.env.APP;
var path = require('path');
var heConfig = require(path.join(process.cwd(), 'lib/config'));
var Promise = require(path.join(process.cwd(), 'backend/model/utils')).promise;
var replaceAll = require(path.join(process.cwd(), 'backend/model/utils')).replaceAll;
var decodeURIComponent = require(path.join(process.cwd(), 'backend/model/utils')).decodeURIComponent;
var controllers, Logger;

//STARS HERE!
configureBackend();


function configureBackend() {
	require(path.join(process.cwd(), 'backend')).configure(app).then(() => {
		controllers = require(path.join(process.cwd(), 'backend/model/backend-controllers-manager'));
		Logger = controllers.logs.createLogger({
			name: "API",
			category: "SERVER"
		});
		configureServer(app);
	});
}

function configureServer(app) {
	setCORS();
	setStaticPaths();
	setProductionRoutes().then(() => {
		startServer();
	});
}

function setCORS() {
	//CORS
	app.all('*', function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-PUSH");
		//console.log(req.method, 'Setting CORS');
		if ('OPTIONS' == req.method) {
			return res.send(200);
		}
		next();
	});
}


function setStaticPaths() {
	app.use('/common', express.static(path.join(process.cwd(), 'src/common')));
	app.use('/vendor', express.static(path.join(process.cwd(), 'vendor')));
	app.use('/bower', express.static('./bower'));


	var files = sander.readdirSync(path.join(process.cwd(), 'src', APP_NAME, 'res'));
	//console.log('SERVER: DEBUG DIR FILES ', files);

	//CURRENT APP RES FOLDERS
	files.forEach(n => {
		var _path = path.join(process.cwd(), 'src', APP_NAME, 'res', n);
		app.use('/' + n, express.static(_path));
		console.log('SERVER: STATIC ROUTE EXPOSED', '/' + n);
	});

	//CURRENT APP SRC (JS && CSS) FOLDERS
	if (!PROD) {
		//console.log('SERVER RAW ASSETS FOR ', APP_NAME);
		app.use('/raw/css', express.static(path.join(process.cwd(), 'src', APP_NAME, 'css')));
		app.use('/raw/js', express.static(path.join(process.cwd(), 'src', APP_NAME, 'js')));
	}
}

function setProductionRoutes() {
	return Promise(function(resolve, reject, emit) {
		app.get('/', function(req, res, next) {
			res.sendFile('/index.html', {
				root: path.join(process.cwd(), dest)
			});
		});

		//reading directories in static folder (app)
		fs.readdir(path.join(process.cwd(), 'src', APP_NAME, 'static'), (err, files) => {
			if (err) {
				console.log('ERROR Reading app static folder', err);
				process.exit(1);
				return;
			}
			files.forEach(directoryName => {
				if (directoryName != 'app') {
					//set static folders as static content. ex: about-us, contact-us
					//console.log('STATIC REWRITE', '/' + directoryName);
					app.use('/' + directoryName, express.static(path.join(process.cwd(), dest, directoryName)));
				}
			});

			//read prerendered file for this app from database and expose it.

			controllers._co(function*() {
				var result = yield controllers.prerender.getAll({
					appName: APP_NAME
				});
				//Logger.debug('PRERENDER VIEWS FOR ', CURRENT_APP_NAME, result);

				if (result) {
					result.forEach(function(item) {
						if (item._doc.name == undefined) return;
						item.url = "/" + replaceAll(item._doc.name, '--', '/');
						app.get(item.url, function(req, res, next) {
							console.log('SERVER GET PRERENDER', item.url);
							res.send(decodeURIComponent(item._doc.content));
						});
						console.log('SERVER PRERENDER ROUTE', item.url);
					});
				}

				redirectToAngular();

				resolve();

			}, redirectToAngular, Logger);

			function redirectToAngular() {

				if (heConfig.use(APP_NAME).i18n_config) {
					var langs = heConfig.use(APP_NAME).i18n_config.languages;
					if (langs && langs.length > 0 && (PROD || MULTILANG)) {
						langs.forEach(langCode => {
							app.get('/' + langCode + '/*', function(req, res, next) {
								res.sendFile('/' + langCode + '/app/index.html', {
									root: path.join(process.cwd(), dest)
								});
							});
							console.log('SERVER: SET ROUTE FOR LANGUAGE', langCode);
						});
					}
				}


				//redirect everything else to angular root
				app.get('/*', function(req, res, next) {
					res.sendFile('/app/index.html', {
						root: path.join(process.cwd(), dest)
					});
				});
			}
		});
	});
}


function getPath(s) {
	try {
		return fs.realpathSync(s);
	}
	catch (e) {
		return false;
	}
}


function startServer() {
	http.listen(port, function() {
		console.log('SERVER: Production? ' + (PROD ? 'YES!' : 'NO!'));
		console.log('SERVER: ROLLING ON PORT ' + port + '!');
	});
}
