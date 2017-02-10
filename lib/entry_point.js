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
var heConfig = require('./config');
var heFirebase = require('./core/firebase');
var heUtils = require('./core/utils');
var PROD = process.env.PROD && process.env.PROD.toString() == '1' || false;
var config = require('./config').multipleConfig;
var copy = require('recursive-copy');
const APP_NAME = process.env.APP;
config.app = APP_NAME;
console.log('DEBUG: CURRENT APP_NAME ->', APP_NAME);
heUtils.ensureDirectory(process.cwd() + '/dist');
heUtils.ensureDirectory(process.cwd() + '/dist-production');
//heUtils.ensureDirectory(process.cwd() + '/dist-production/' + APPNAME);
heOptions.setApp(config.app, config.apps[config.app]);
heOptions.dest('dist', 'dist-production');

console.log('DEBUG: BUILD-START');

heBuild.all().then(() => {

  console.log('DEBUG: BUILD-SUCCESS');


  heFirebase.sendSignal('reload', {
    full_reload: true
  });

  if (process.env.PROD == 1) {

    var src = process.cwd() + '/src/' + APP_NAME + '/res';
    var dest = process.cwd() + '/dist-production';

    console.log('DEBUG: BUILD-SUCCESS, RESOURCE COPY', src, dest);


    copy(src, dest, {
        filter: [
          '**'
        ],
        callback: function(error, results) {
          if (error) {
            console.error('Copy failed: ' + error);
            process.exit(0);
          }
          else {
            console.info('Copied ' + results.length + ' files');
            process.exit(0);
          }
        }
      }).then(function(results) {
        console.info('Copied ' + results.length + ' files');
        if(PROD) return runServer();
        process.exit(0);
      })
      .catch(function(error) {
        console.error('Copy failed: ' + error);
        process.exit(0);
      });


    return;
  }
  heWatch.templates();
  heWatch.scripts();
  heWatch.styles();
});

function runServer(){
  require('./server');
}
