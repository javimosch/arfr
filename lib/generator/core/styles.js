var heUtils = require('./utils');
var path =require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var heConfig = resolver.handlebarsContext();
var logger = resolver.logger().get('SERVER','GENERATOR-STYLES');
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
	var raw = heUtils.concatenateAllFilesFrom(PATH);
	var dest = heConfig().output(DEST_FOLDER+'/'+g.destFilename);
	heUtils.createFile(dest, raw);
	logger.debugTerminal('styles build ' + g.destFilename + ' success at ' + new Date());
	emit('build-success',{
		reload_css: true
	});
}

/*
* retrieve css files from current project folder (/src/project_name/css)
*/
function getAll(){
	return heUtils.retrieveFilesFromPathSync(PATH);
}

function cssTagTemplate(context){
    var rta = heUtils.replaceAll('<link href="_HREF_" rel="stylesheet">','_HREF_',context.href||'[href_field_required]');
    //console.log('BUILDER STYLES (cssTagTemplate): ',rta);
    return rta;
}

function printCSSTags(folderPath) {
    var files = getAll();
    var ret = "<!-- printCSS: development -->\n";
    files.forEach((file)=>{
    	//console.log('BUILDER STYLES (printCSS): building path ->',folderPath,file.fileName);
        ret+= cssTagTemplate({
            href: path.join(folderPath,file.fileName)
        });
    });
    return ret;
}


var _events = {};
module.exports = {
	path: (p) => PATH = p,
	dest: (dest) => {},
	build: build,
	cssTagTemplate:cssTagTemplate,
	printCSSTags:printCSSTags,
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