"use strict";
var resolver = require('./resolver');
var express = require('express');
var path = require("path");
var app = express();

if (resolver.env().EXPRESS_VERBOSE) {
	app.use(require('express-request-response-logger')());
}

//ENVS
//resolver.logger().get("SERVER","ENVS").debugTerminal(resolver.env());

resolver.co(function*() {

	//DATABASE 
	yield resolver.database().configure();
	var logger = resolver.logger().get('SERVER', 'BOOTSTRAP');
	logger.debugTerminal('DATABASE OK');

	if (resolver.env().PROD) {
		//GENERATOR
		logger.debugTerminal('GENERATOR:START');
		yield resolver.generator().configure(app);
		//yield resolver.generatorBags().configure(app);
		resolver.generator().logger().debugTerminal('GENERATOR:OK');
	}

	//MIDDLEWARES, ROUTES AND SERVER
	resolver.middlewares().configure(app, express);
	resolver.routes().configure(app, express);
	require(path.join(process.cwd(), 'lib/backend')).configure(app).then(() => {});
	require('http').Server(app).listen(resolver.env().PORT, function() {
		logger.debugTerminal('SERVER: Production? ' + (resolver.env().PROD ? 'YES!' : 'NO!'));
		logger.debugTerminal('SERVER: ROLLING ON PORT ' + resolver.env().PORT + '!', "http://localhost:" + resolver.env().PORT);
	});

}).catch((err) => console.log('SERVER:OFF', err));
