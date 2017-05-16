var gulp =  require('gulp');
var file  = require('gulp-file');
var rollupWrapper = require('rollup');
var webpackStream = require('webpack-stream');
var webpack2 = require('webpack');
var babel_plugin = require('rollup-plugin-babel');
var heParser = require('./utils.html-parser');
var source = require('vinyl-source-stream');
var heUtils = require('./utils');
var minify = require('minify-content');
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var heConfig = resolver.handlebarsContext();
var babel = require("babel-core");
var PROD = process.env.PROD && process.env.PROD.toString() == '1' || false;

var logger = resolver.logger().get('SERVER', 'GENERATOR-SCRIPTS');

var g = {
	destFilename: 'app.js'
}
var PATH = './src/client/' + resolver.env().APP_NAME + 'js';
var DIST = './dist/js';
var DEST_FOLDER = 'js';

function watch() {
	//logger.debug('watch',PATH);
	heUtils.watch(PATH, () => {
		build();



	});
}

function build() {

	if (resolver.env().ROLLUP) {

		return rollupWrapper.rollup({
				entry: path.join(PATH, 'main.js'),
				plugins: [
					babel_plugin({
						presets: [
							[
								"es2015", {
									"modules": false
								}
							]
						],
						babelrc: false,
						exclude: 'node_modules/**'
					})
				]
			})
			.then((bundle) => {
				var generated = bundle.generate();
				var code = generated.code;
				return file(g.destFilename, code, {
						src: true
					})
					.pipe(gulp.dest(heConfig().output(DEST_FOLDER))).on('end', () => {
						logger.debugTerminal("Rollup finish");
						success();
					})
			}).catch(err=>{
				logger.error(err);
			});



	}

	var raw = heUtils.concatenateAllFilesFrom(PATH, {
		debug: false
	});
	if (process.env.PROD.toString() == '1') {
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
		logger.debugTerminal('build after chars len', r && r.code && r.code.length || null);
	}
	else {
		build_next(raw);
	}

	function build_next(_raw) {
		heConfig().jsVendorFileName = g.destFilename;
		var dest = heConfig().output(DEST_FOLDER + '/' + g.destFilename);
		heUtils.createFile(dest, _raw);
		success();
	}

	function success() {
		logger.debugTerminal('build ' + g.destFilename + ' success at ' + new Date());
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
