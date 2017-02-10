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
var port = process.env.PORT || 3000;
var config = require('./config.js').multipleConfig;
var btoa = require('btoa');
var fs = require('fs');
var dest = 'dist';
var appStaticResPaths = ['img', 'fonts', 'images', 'includes', 'files', 'lib', 'styles', 'css', 'js', 'portfolio']; //templates

const ROOT_MODE = true; //process.env.ROOT_MODE && process.env.ROOT_MODE.toString() == '1' || false;
const APP_REWRITE = true; //process.env.APP_REWRITE && process.env.APP_REWRITE.toString() == '1' || false;
const APP_NAME = process.env.APP;

var path = require('path');
var Promise = require(path.join(process.cwd(), 'backend/model/utils')).promise;
var replaceAll = require(path.join(process.cwd(), 'backend/model/utils')).replaceAll;
var decodeURIComponent = require(path.join(process.cwd(), 'backend/model/utils')).decodeURIComponent;

function isCurrentApp(k) {
	return k == APP_NAME;
}

function eachApp(action) {
	Object.keys(config.apps).forEach(appName => {
		action(appName);
	});
}


var controllers, Logger;

require(path.join(process.cwd(), 'backend')).configure(app).then(() => {
	controllers = require(path.join(process.cwd(), 'backend/model/backend-controllers-manager'));
	Logger = controllers.log.createLogger({
		name: "API",
		category: "SERVER"
	});
	configure(app);
});







function setStaticPaths() {
	app.use('/src/common', express.static(path.join(process.cwd(), 'src/common')));
	appStaticResPaths.forEach(n => {
		//console.log('SERVER: route rule (static) ->', '/' + n + '/*')
		app.use('/' + n, express.static(dest + '/' + n));
	});
	eachApp((name) => {
		app.use('/' + name + '/css/raw', express.static(path.join(process.cwd(), 'src', name, 'css')));
		app.use('/' + name + '/js/raw', express.static(path.join(process.cwd(), 'src', name, 'js')));
	})
}

function setProductionRoutes() {
	return Promise(function(resolve, reject, emit) {
		app.get('/', function(req, res, next) {
			res.sendFile('/index.html', {
				root: path.join(process.cwd(), dest)
			});
		});

		if (APP_REWRITE) {
			//reading directories in static folder (app)
			fs.readdir(path.join(process.cwd(), 'src', APP_NAME, 'static'), (err, files) => {
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
					//redirect everything else to angular
					app.get('/*', function(req, res, next) {
						res.sendFile('/app/index.html', {
							root: path.join(process.cwd(), dest)
						});
					});
				}
			});
		}
		else {
			resolve();
		}
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

function replaceAll(target, search, replacement) {
	return target.replace(new RegExp(search, 'g'), replacement);
};

function configure(app) {
	if (PROD) {
		dest = 'dist-production';

		console.log('SERVER: static paths');
		setStaticPaths();
		console.log('SERVER: production paths');
		setProductionRoutes().then(() => {
			console.log('SERVER: starting server');
			startServer();
		})
	}
	else {

		setStaticPaths();

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



		//

		//static
		app.use('/', express.static('./' + dest));
		//vendor
		app.use('/vendor', express.static('./vendor'));
		app.use('/bower', express.static('./bower'));


		//root route render APP_NAME index
		app.get('/', function(req, res, next) {
			res.sendFile(process.env.APP_NAME + '/index.html', {
				root: __dirname + '/' + dest
			});
		});

		appStaticResPaths.forEach(n => {
			Object.keys(config.apps).forEach(appName => {
				if (!isCurrentApp(appName)) return;
				var path = getPath(process.cwd() + '/src/' + appName + '/res/' + n);
				if (path == false) return;
				//var route = '/' + appName + '/' + n;
				var route = '/' + n;
				app.use(route, express.static(path));
				//console.log('SERVER: static-path', route);
				if (n == 'fonts') {
					route = '/' + appName + '/css/' + n;
					//console.log('SERVER: static-path (CSS/FONTS)', route, path);
					app.use(route, express.static(path));
				}
			});
		});





		if (ROOT_MODE) {
			appStaticResPaths.forEach(n => {
				var path_str = process.cwd() + '/src/' + APP_NAME + '/res/' + n;
				var path = getPath(path_str);
				if (path == false) {
					return;
				}
				var route = '/' + n;
				app.use(route, express.static(path));
				//console.log('SERVER: STATIC PATH on', route);
			});
			setProductionRoutes().then(() => {
				startServer();
			});
		}
		else {
			startServer();
		}




	}
}

function startServer() {
	http.listen(port, function() {
		console.log('SERVER: Production? ' + (PROD ? 'YES!' : 'NO!'));
		console.log('SERVER: ROLLING ON PORT ' + port + '!');
	});
}
