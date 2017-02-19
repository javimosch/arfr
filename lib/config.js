var path = require('path');
var PROD = process.env.PROD && process.env.PROD.toString() == '1' || false;


var ROOT_MODE = true;
ROOT_MODE = ROOT_MODE || PROD;

var _outputLanguageFolder = '';
var _loaded = false;
var _data = {
	outputLanguageFolder: function(lang) {
		_outputLanguageFolder = lang;
	},
	setLanguage: function(lang) {
		if (_data.i18n_config) {
			_data.i18n_config.current = lang;
			_data.outputLanguageFolder(lang);
		}
		else {
			console.log('i18n_config required in project configuration');
		}
	},
	setDefaultLanguage: function() {
		if (_data.i18n_config) {
			_data.i18n_config.current = _data.i18n_config.default || 'en';
			_data.outputLanguageFolder(''); //default language compiles to root
		}
		else {
			console.log('i18n_config required in project configuration');
		}
	},
	outputBaseDir: function() {
		var rta = process.cwd();
		if (PROD) {
			rta += '/' + _data.dest_production || 'dist-production';
		}
		else {
			rta += '/' + _data.dest || 'dist';
		}
		rta = rta.replaceAll('//', '/');
		if (_outputLanguageFolder) {
			rta = path.join(rta, _outputLanguageFolder);
		}
		return rta;
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

var self = function(data) {

	if (data) {
		if (!_loaded && data.appName) {
			Object.assign(_data, require(path.join(process.cwd(), 'configs/config-' + data.appName)));
		}
		Object.assign(_data, data);

		console.log('DATA: ', Object.keys(_data).length);
	}



	if (_data.i18n_config && !_data.i18n_config.current) {
		_data.i18n_config.current = _data.i18n_config.default || 'en';
	}

	_data.PROD = (process.env.PROD.toString() == '1' && true) || false;
	return _data;
};
self.use = (appName)=>{
	return self({
		appName:appName
	});
}

module.exports = self;


/*
var fs = require('fs');
var configsFileNames = fs.readdirSync(process.cwd() + '/configs');
var config = {
	app: process.env.APP || 'unkown', //default app
};
configsFileNames.forEach(path => {
	var n = path.replace('.js', '').replace('config-', '');
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
module.exports.getAppConfig = (app) => config.apps[app];
*/
