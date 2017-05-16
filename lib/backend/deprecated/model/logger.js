var fs = require('fs');

var simpleLogger = require('simple-node-logger');


module.exports = function(moduleName) {
	var opts = {
		domain:moduleName,
		category:moduleName,
		logFilePath:'backend.log',
		timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
		// dateFormat:'YYYY.MM.DD'
	};
	var log =  simpleLogger.createSimpleLogger( opts );
	if(process.env.LOG_LEVEL){
		log.setLevel(process.env.LOG_LEVEL);
	}
	//console.log('LOGGER: New',moduleName);
	return log;
}

