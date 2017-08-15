"use strict";

var gulp = require('gulp');
var file = require('gulp-file');
var rollupWrapper = require('rollup');
var webpackStream = require('webpack-stream');
var webpack2 = require('webpack');

var babel_plugin = require('rollup-plugin-babel');
var resolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var minifyHarmony = require('uglify-js-harmony').minify;

var buble = require('rollup-plugin-buble');

var heParser = require('./utils.html-parser');
var source = require('vinyl-source-stream');
var heUtils = require('./utils');
var minify = require('minify-content');
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var heConfig = resolver.handlebarsContext();
var babel = require("babel-core");
var PROD = process.env.PROD && process.env.PROD.toString() == '1' || false;
var uglify = require('rollup-plugin-uglify');
var logger = resolver.logger().get('SERVER', 'GENERATOR-SCRIPTS');
var fs = require('fs');
var UglifyJS = require("uglify-js");
var g = {
	destFilename: 'app.js',
	rollupCache: null
}
var PATH = './src/client/' + resolver.env().APP_NAME + 'js';
var DIST = './dist/js';
var DEST_FOLDER = 'js';
let buildInProgress = false;

function watch() {
	//logger.debugTerminal('watch',PATH);
	heUtils.watch(PATH, () => {
		build().catch(err => logger.errorTerminal('Watch Build:', err));
	});

	heUtils.watch(path.join(resolver.CONSTANT().SRC_CLIENT_PATH, resolver.env().APP_NAME, 'context.js'), () => {
		build().catch(err => logger.errorTerminal('Watch Build (Context):', err));
	});

	heUtils.watch(resolver.CONSTANT().CLIENT_COMMON_JS_PATH, () => {
		logger.debugTerminal('Build triggered by common');
		build().catch(err => logger.errorTerminal('Watch Build (Common):', err));
	});

}

function build() {
	return resolver.coWrapExec(function*() {

		if (buildInProgress) {
			logger.debugTerminal('SKIP (Already in progress)');
			return resolver.Promise.resolve(true); //already in progress
		}
		else {
			buildInProgress = true;
		}


		var exists = yield resolver.getFacade('fs').exists(path.join(PATH, 'main.js'));
		if (!exists && resolver.env().ROLLUP) {
			logger.warnTerminal("Rollup expects main.js at", PATH);
		}
		if (exists && resolver.env().ROLLUP) {
			let pkg = JSON.parse(fs.readFileSync('./package.json')),
				external = Object.keys(pkg.dependencies || {});

			var rollupExternal = resolver.handlebarsContext()().rollupExternal || [];
			logger.debugTerminal('Externals', rollupExternal);

			var plugins = [
				babel_plugin({
					presets: [
						[
							"es2015", {
								"modules": false
							},

						], "stage-3"
					],
					babelrc: false,
					exclude: 'node_modules/**'
				}),
				//buble(),
				resolve({
					jsnext: true,
					main: true,
					externals: external,
					// not all files you want to resolve are .js files
					extensions: ['.js', '.json'], // Default: ['.js']
				}),
				commonjs({
					include: 'node_modules/**',
					exclude: '**/*.css'
				})
			];
			if (resolver.env().PROD) {
				plugins.push(uglify({}, minifyHarmony));
			}
			var startDate = Date.now();
			logger.debugTerminal("Rollup start");
			var bundle = g.rollupCache = yield rollupWrapper.rollup({
				entry: path.join(PATH, 'main.js'),
				plugins: plugins,
				cache: g.rollupCache,
				//external: external
			});
			logger.debugTerminal("ROLLUP BUNDLED", ((Date.now() - startDate) / 1000).toFixed(2) + 'sec');
			startDate = Date.now();
			yield bundle.write({
				format: 'iife',
				indent: false,
				dest: path.join(heConfig().output(DEST_FOLDER), g.destFilename),
				sourceMap: (resolver.env().PROD === false) ? 'inline' : false
			});

			logger.debugTerminal("ROLLUP WRITE DOWN", ((Date.now() - startDate) / 1000).toFixed(2) + 'sec');

			if (resolver.env().PROD) {
				//var generated = bundle.generate();
				//var code = generated.code;
				logger.debug("Read output and uglify");
				/*
				var result = UglifyJS.minify(code);
				if (result.error) {

					logger.error("Uglify error", result.error);
				}
				else {
					yield heUtils.createFile(path.join(heConfig().output(DEST_FOLDER), g.destFilename), result.code);
				}*/
			}

			if (resolver.env().HOT_MAQUETTE) {
				var code = bundle.generate().code;
				resolver.generatorFirebase().sendHotScript(code);
				logger.debugTerminal('HOT_MAQUETTE on', code.length);
			}
			else {
				logger.debugTerminal('HOT_MAQUETTE off');
			}

			logger.debugTerminal("Rollup finish");

			return success(resolver.env().HOT_MAQUETTE);
		}
		else {
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
				return build_next(r.code);
			}
			else {
				return build_next(raw);
			}
		}

		function build_next(_raw) {
			heConfig().jsVendorFileName = g.destFilename;
			var dest = heConfig().output(DEST_FOLDER + '/' + g.destFilename);
			heUtils.createFile(dest, _raw);
			return success();
		}

		function success(wasHotReload) {
			buildInProgress = false;
			logger.debugTerminal('Build ' + g.destFilename + ' success');
			wasHotReload = wasHotReload || false;


			emit('build-success', {
				wasHotReload: resolver.env().HOT_MAQUETTE
			});
			return resolver.Promise.resolve(true);
		}

		function handleError() {
			buildInProgress = false;
			logger.debugTerminal('Build ' + g.destFilename + ' fail');
			return resolver.Promise.resolve(false);
		}

	});
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
