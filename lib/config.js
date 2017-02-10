var PROD = process.env.PROD && process.env.PROD.toString() == '1' || false;


var ROOT_MODE = true;
ROOT_MODE = ROOT_MODE || PROD;


var _data = {
	outputBaseDir: function() {
		var rta = process.cwd();
		if (PROD) {
			rta += '/' + _data.dest_production || 'dist-production';
		}
		else {
			rta += '/' + _data.dest || 'dist';
		}
		return rta.replaceAll('//', '/');
	},
	output: function(path) {
		var rta = "";
		if (PROD || ROOT_MODE) {
			rta += _data.outputBaseDir();
		}
		else {
			rta += _data.outputBaseDir() + '/' + _data.appName;
		}
		if (path) {
			rta += '/' + path;
		}
		return rta.replaceAll('//', '/');
	}
};

module.exports = function(data) {
	Object.assign(_data, data);
	
	if(_data.i18n_config && !_data.i18n_config.current){
		_data.i18n_config.current = _data.i18n_config.default || 'en';
	}
	
	_data.PROD = (process.env.PROD.toString() == '1' && true) || false;
	return _data;
};


//MULTIPLE CONFIGS
(function() {
	var fs = require('fs');
	var configsFileNames = fs.readdirSync(process.cwd() + '/configs');
	var config = {
		app: process.env.APP_NAME || 'unkown', //default app
	};
	configsFileNames.forEach(path => {
		var n = path.replace('.js', '').replace('config-', '');
		//console.log('DEBUG: loading config ' + n);
		config.apps = config.apps || {};
		config.apps[n] = require(process.cwd() + '/configs/' + path);
		if (!config.apps[n].root) {
			if (ROOT_MODE) {
				config.apps[n].root = '/';
			}
			else {
				config.apps[n].root = '/' + n + '/';
			}

		}
		if (!config.apps[n].res) {

			if (ROOT_MODE) {
				config.apps[n].res = '/';
			}
			else {
				config.apps[n].res = '/' + n + '/';
			}
		}
		//console.log(config.apps[n]);
	});
	module.exports.multipleConfig = config;
})();