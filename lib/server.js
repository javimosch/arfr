"use strict";
var resolver = require('./resolver');
var express = require('express');
var path = require("path");
var app = express();
var path = require('path');


//ENVS
//resolver.logger().get("SERVER","ENVS").debugTerminal(resolver.env());

resolver.co(function*() {

	//DATABASE 
	yield resolver.database().configure();
	var logger = resolver.logger().get('SERVER', 'BOOTSTRAP');
	logger.debug('DATABASE OK');

	//GENERATOR
	logger.debug('GENERATOR:START');
	yield resolver.generator().configure(app);
	resolver.generator().logger().debug('GENERATOR:OK');

	//MIDDLEWARES, ROUTES AND SERVER
	resolver.middlewares().configure(app, express);
	resolver.routes().configure(app, express);
	//require(path.join(process.cwd(), 'backend')).configure(app).then(() => {});
	require('http').Server(app).listen(resolver.env().PORT, function() {
		logger.debug('SERVER: Production? ' + (resolver.env().PROD ? 'YES!' : 'NO!'));
		logger.debug('SERVER: ROLLING ON PORT ' + resolver.env().PORT + '!', "http://localhost:" + resolver.env().PORT);
	});

}).catch((err) => console.log('SERVER:OFF', err));


/*
//DATABASE 
resolver.database().configure().then(() => {
	//LOGGER
	logger = resolver.logger().get('SERVER', 'GENERAL');
	logger.debug('DATABASE:OK');
	//GENERATOR
	resolver.generator().configure(app).then(() => {
		resolver.generator().logger().debug('GENERATOR:OK');
		//MIDDLEWARES, ROUTES AND SERVER
		resolver.middlewares().configure(app, express);
		resolver.routes().configure(app, express);
		require(path.join(process.cwd(), 'backend')).configure(app).then(() => {});
		require('http').Server(app).listen(resolver.env().PORT, function() {
			logger.debug('SERVER: Production? ' + (resolver.env().PROD ? 'YES!' : 'NO!'));
			logger.debug('SERVER: ROLLING ON PORT ' + resolver.env().PORT + '!', "http://localhost:" + resolver.env().PORT);
		});
	}).catch((err) => {
		logger.debug('GENERATOR:OFF', err);
	});
}).catch((err) => console.log('DATABASE:OFF', err));
*/
