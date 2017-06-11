var heUtils = require('./utils');
var path = require('path');
var CleanCSS = require('clean-css');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var heConfig = resolver.handlebarsContext();
var logger = resolver.logger().get('GENERATOR', 'STYLES');
var rename = require("gulp-rename");
var fs = require('fs');
var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

const SASS_SOURCE_FILENAME = 'main.scss';
const SASS_COMPILED_FILENAME = 'main.css';

var g = {
	destFilename: 'app.css'
}
var PATH = './src/css';
var DEST_FOLDER = 'css';

function watch() {
	heUtils.watch(PATH, () => {
		build();
	});
}

function build() {


	gulp.task('sass', function() {
		var mainPath = path.join(process.cwd(), 'src/client', resolver.env().APP_NAME, '/css/', SASS_SOURCE_FILENAME);
		if (!fs.existsSync(mainPath)) {
			return logger.warnTerminal(SASS_SOURCE_FILENAME, ' not found at ', mainPath);
		}
		var options = {};
		var compiledBasePath = path.join(process.cwd(), resolver.env().DEST, 'css');
		logger.debugTerminal('Compiling', compiledBasePath, SASS_COMPILED_FILENAME);
		if (resolver.env().PROD) {
			options.outputStyle = 'compressed';
			return gulp.src(mainPath)
				.pipe(sass(options).on('error', sass.logError))
				.pipe(rename(SASS_COMPILED_FILENAME))
				.pipe(gulp.dest(compiledBasePath));
		}
		else {
			return gulp.src(mainPath)
				.pipe(sourcemaps.init())
				.pipe(sass(options).on('error', sass.logError))
				.pipe(sourcemaps.write())
				.pipe(rename(SASS_COMPILED_FILENAME))
				.pipe(gulp.dest(compiledBasePath));
		}
	});
	gulp.start('sass');

	//logger.debugTerminal('Concat files...');
	var raw = heUtils.concatenateAllFilesFrom(PATH, {
		ext: ['css']
	});
	//logger.debugTerminal('Concat files...', raw.length, 'chars');
	if (resolver.env().PROD) {
		var options = { /* options */ };
		var output = new CleanCSS(options).minify(raw);
		if (output.errors && output.errors.length > 0) {
			logger.error(output.errors); // a list of errors raised    
		}
		if (output.warnings && output.warnings.length > 0) {
			logger.warn(output.warnings); // a list of errors raised    
		}
		logger.debugTerminal("MINIFIER deflated", Math.round(output.stats.minifiedSize * 100 / output.stats.originalSize) + '%');
		raw = output.styles;
	}

	var dest = heConfig().output(DEST_FOLDER + '/' + g.destFilename);
	heUtils.createFile(dest, raw);
	logger.debugTerminal('OUT' + g.destFilename);
	emit('build-success', {
		reload_css: true
	});
}

/*
 * retrieve css files from current project folder (/src/project_name/css)
 */
function getAll() {
	return heUtils.retrieveFilesFromPathSync(PATH);
}

function cssTagTemplate(context) {
	var rta = heUtils.replaceAll('<link href="_HREF_" rel="stylesheet">', '_HREF_', context.href || '[href_field_required]');
	//console.log('BUILDER STYLES (cssTagTemplate): ',rta);
	return rta;
}

function printCSSTags(folderPath) {
	var files = getAll();
	var ret = "<!-- printCSS: development -->\n";
	files.forEach((file) => {
		//console.log('BUILDER STYLES (printCSS): building path ->',folderPath,file.fileName);
		if (file.fileName.indexOf('.scss') !== -1) return;

		ret += cssTagTemplate({
			href: path.join(folderPath, file.fileName)
		});
	});
	return ret;
}


var _events = {};
module.exports = {
	path: (p) => PATH = p,
	dest: (dest) => {},
	build: build,
	cssTagTemplate: cssTagTemplate,
	printCSSTags: printCSSTags,
	watch: watch,
	on: (evt, handler) => {
		_events[evt] = _events[evt] || [];
		_events[evt].push(handler);
	}
};

function emit(evt, p) {
	_events[evt] = _events[evt] || [];
	_events[evt].forEach(handler => handler(p));
}
