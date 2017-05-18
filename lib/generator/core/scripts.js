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
var g = {
	destFilename: 'app.js'
}
var PATH = './src/client/' + resolver.env().APP_NAME + 'js';
var DIST = './dist/js';
var DEST_FOLDER = 'js';

function watch() {
	//logger.debug('watch',PATH);
	heUtils.watch(PATH, () => {
		build().catch(err => logger.errorTerminal('Watch Build:', err));
	});
}

function build() {
	return resolver.coWrapExec(function*() {


		if (resolver.env().ROLLUP) {

			var exists = yield resolver.getFacade('fs').exists(path.join(PATH, 'main.js'));

			if (!exists) {
				logger.errorTerminal("Rollup expects main.js at", PATH);
				return handleError();
			}

			let pkg = JSON.parse(fs.readFileSync('./package.json')),
				external = Object.keys(pkg.dependencies || {});
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
			logger.debugTerminal("Rollup start");
			var bundle = yield rollupWrapper.rollup({
				entry: path.join(PATH, 'main.js'),
				plugins: plugins
			});
			logger.debugTerminal("Rollup bundled");

			var generated = bundle.generate();
			var code = generated.code;
			yield bundle.write({
				dest: path.join(heConfig().output(DEST_FOLDER), g.destFilename),
				//format: 'cjs',
				sourceMap: true
			});
			logger.debugTerminal("Rollup finish");
			return success();
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

		function success() {
			logger.debugTerminal('Build ' + g.destFilename + ' success');
			emit('build-success');
			return resolver.Promise.resolve(true);
		}
		function handleError() {
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
