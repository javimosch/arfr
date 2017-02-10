var heParser = require('./utils.html-parser');
var path = require('path');
var heUtils = require('./utils');
var minify = require('minify-content');
var heConfig = require('../config');
var babel = require("babel-core");
var PROD = process.env.PROD && process.env.PROD.toString() == '1' || false;



var g = {
	destFilename: 'app.js'
}
var PATH = './src/' + process.env.APP_NAME + 'js';
var DIST = './dist/js';
var DEST_FOLDER = 'js';

function watch() {
	//console.log('DEBUG: scripts watch',PATH);
	heUtils.watch(PATH, () => {
		build();

	

	});
}

function build() {
	/*
	heUtils.copyFilesFromTo(PATH,DIST,{
		formatPathHandler: (path) => {
            return path;
        },
		formatContentHandler:(raw)=>{
			return raw; //less, sass, stylus here.
		}
	});*/

	//console.log('DEBUG: MAIN Build JS Path',PATH);

	var raw = heUtils.concatenateAllFilesFrom(PATH, {
		debug: false
	});

	//console.log('DEBUG: scripts build before chars len', raw.length && raw.length || null);

	if (process.env.PROD.toString() == '1') {

		/*
		minify(raw,'js',(_raw)=>{
			_raw = _raw.code;
			build_next(_raw);
		})*/

		var settings = {
			presets: ["es2015"],
			minified: true,
			comments: true
		};

		if (process.env.PROD_DEPLOY && process.env.PROD_DEPLOY.toString() == '1') {
			settings.comments = false
		}
		else {
			settings.sourceMaps = 'inline';
		}

		var r = babel.transform(raw, settings);
		build_next(r.code);
		console.log('DEBUG: scripts build after chars len', r && r.code && r.code.length || null);
	}
	else {
		build_next(raw);
	}

	function build_next(_raw) {
		heConfig().jsVendorFileName = g.destFilename;
		var dest = heConfig().output(DEST_FOLDER + '/' + g.destFilename);
		heUtils.createFile(dest, _raw);
		console.log('DEBUG: scripts build ' + g.destFilename + ' success at ' + new Date());
		emit('build-success');
	}
}


function emit(evt, p) {
	_events[evt] = _events[evt] || [];
	_events[evt].forEach(handler => handler(p));
}
var _events = {};



function getAll() {
	return heUtils.retrieveFilesFromPathSync(PATH);
}

function tagTemplate(context) {
	var rta = heUtils.replaceAll('<script type="text/javascript" src="_SRC_"></script>', '_SRC_', context.src || '[src_field_required]');
	return rta;
}

function printTags(folderPath) {
	var files = getAll();
	var ret = "<!-- printJSTags: development -->\n";
	files.forEach((file) => {
		ret += tagTemplate({
			src: path.join(folderPath, file.fileName)
		});
	});
	return ret;
}

module.exports = {
	path: (p) => PATH = p,
	dest: (dest) => DIST = dest + '/' + DEST_FOLDER,
	build: build,
	tagTemplate: tagTemplate,
	printTags: printTags,
	watch: watch,
	on: (evt, handler) => {
		_events[evt] = _events[evt] || [];
		_events[evt].push(handler);
	}
};

