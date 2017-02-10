var path = require("path");
var sander = require('sander');
var heParser = require(path.join(process.cwd(), '/lib/core/utils.html-parser'));
var heFirebase = require(path.join(process.cwd(), '/lib/core/firebase'));
var heUtils = require(path.join(process.cwd(), '/lib/core/utils'));
var heStyle = require(path.join(process.cwd(), '/lib/core/styles'));
var heScript = require(path.join(process.cwd(), '/lib/core/scripts'));
var Handlebars = require('handlebars');
var readDirFiles = require('read-dir-files');

var utils = require(path.join(process.cwd(), '/lib/core/utils'));

//var basedir = process.cwd()+'/dist-production';
//var fileName = 'test.js';
//var content = '//test';
//console.log('util-createFile', basedir, fileName, content.length, ' characters');
///return sander.writeFile(basedir, fileName, content);


var rta = heUtils.normalizeFilesTreePreservePath(readDirFiles.readSync(process.cwd() + '/src/common/partials'));

console.info(JSON.stringify(rta))