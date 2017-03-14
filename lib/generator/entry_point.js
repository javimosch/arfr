"use strict";
require('dotenv').config({
  silent: true,
  path: process.cwd() + '/.env'
});

var argv = require('yargs').argv;
var exeCute = require('exe');
var fs = require('fs');
var heBuild = require('./main').build;
var heWatch = require('./main').watch;
var heOptions = require('./main').options;
var heLoads = require('./main').load;
var heFirebase = require('./core/firebase');
var heUtils = require('./core/utils');
var PROD = process.env.PROD && process.env.PROD.toString() == '1' || false;
var copy = require('recursive-copy');
const APP_NAME = process.env.APP;

heUtils.ensureDirectory(process.cwd() + '/dist');
heUtils.ensureDirectory(process.cwd() + '/dist-production');
heOptions.setApp(APP_NAME);
heOptions.dest('dist', 'dist-production');
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var heConfig = resolver.handlebarsContext();

var logger = resolver.logger().get('SERVER','GENERATOR-ENTRY');

logger.debug('CURRENT APP_NAME ->', APP_NAME);
logger.debug('outputLanguageFolder', heConfig().outputLanguageFolder());
logger.debug('outputBaseDir', heConfig().outputBaseDir());
logger.debug('output', heConfig().output());

logger.debug('BUILDER: BUILD-START');
heBuild.all().then(() => {
  logger.debug('BUILDER: BUILD-SUCCESS');
  heFirebase.sendSignal('reload', {
    full_reload: true
  });
  heWatch.templates();
  heWatch.scripts();
  heWatch.styles();
}).catch((err) => {
  logger.debug('BUILDER: BUILD-FAIL', err);
});
