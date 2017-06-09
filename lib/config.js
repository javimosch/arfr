var reload = require('require-reload')(require);
var lodash = require('lodash');
var path = require('path');
var resolver = require('./resolver');
var PROD = resolver.env().PROD;
var ROOT_MODE = true;
ROOT_MODE = ROOT_MODE || PROD;
var _outputLanguageFolder = '';
var _loaded = false;

function logger() {
	return resolver.logger().get('SERVER', 'HBS-CONTEXT');
}
var _data = {
	getI18NString: function(code) {
		var raw = '[' + code.toUpperCase() + ']';
		if (_data.i18n_config) {
			var current = _data.i18n_config.current || 'en';
			if (_data.i18n && _data.i18n[code]) {
				if (_data.i18n[code][current]) {
					//fetch from database.
					raw = _data.i18n[code][current];
				}
				else {
					raw = '[' + code.toUpperCase() + ']';
				}
			}
			else {
				logger().warn('i18n missing', code);
			}
		}
		return raw;
	},
	outputLanguageFolder: function(lang) {
		_outputLanguageFolder = (lang !== undefined) ? lang : '';
		return _outputLanguageFolder;
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
			rta += '/' + (_data.dest_production || 'dist-production');
		}
		else {
			rta += '/' + (_data.dest || 'dist');
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

function reloadData() {
	var appContextPath = resolver.pathTo(resolver.CONSTANT().SRC_CLIENT_PATH, path.join(resolver.env().APP_NAME, "context.js"));
	var exists = resolver.getFacade('fs').existsSync(appContextPath);
	if (!exists) {
		logger().warn('context file expected at path ', appContextPath);
	}
	else {
		Object.assign(_data, reload(appContextPath));

	}
}

var self = function(data) {
	if (data) {
		//logger().debugTerminal('Received some keys', Object.keys(data));
		if (true) { //!_loaded && data.appName
			reloadData();
		}
		if (data.i18n) {
			for (var x in data.i18n) {
				_data.i18n = _data.i18n || {};
				_data.i18n[x] = data.i18n[x];
			}
		}
	}
	if (_data.i18n_config && !_data.i18n_config.current) {
		_data.i18n_config.current = _data.i18n_config.default || 'en';
	}

	_data.PROD = PROD;


	return _data;
};
self.assign = function(newData) {
	reloadData();
	var combinedData = lodash.clone(_data, true);
	Object.assign(combinedData, newData);
	return combinedData;
};
self.use = (appName) => {
	return self({
		appName: appName
	});
}

module.exports = self;
