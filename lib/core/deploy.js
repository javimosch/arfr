"use strict";

var argv = require('yargs').argv;
var FtpDeploy = require('ftp-deploy');

var fs = require('fs');
var utils = require('./utils.js');
var path = require('path');
let co = require("co");
let request = require("co-request");
require('dotenv').config();

//var heBuild = require('./he').build;
//var heOptions = require('./he').options;
//var heLoads = require('./he').load;



var g = {
    dest: process.cwd() + '/dist-production'
};

var configUploaded = false;

var target = argv.target;

var APP_NAME = process.env.APP_NAME;

console.log('APP_NAME', process.env.APP_NAME)

var config = require(process.cwd() + '/configs/config-' + APP_NAME);



if (!config.deploy) {
    console.log('DEPLOY: check deploy section', APP_NAME);
    process.exit(0);
}

if (!config.deploy.ftp) {
    console.log('DEPLOY: check deploy.ftp section', APP_NAME);
    process.exit(0);
}

var auth = {
    hostname: config.deploy && config.deploy.ftp && config.deploy.ftp.hostname,
    port: config.deploy && config.deploy.ftp && config.deploy.ftp.port || 21,
    username: config.deploy && config.deploy.ftp && config.deploy.ftp.username,
    password: config.deploy && config.deploy.ftp && config.deploy.ftp.password
};


if (!auth.password) {
    console.log('DEPLOY: check enviromental variable FTP_PASSWORD', APP_NAME);
    process.exit(0);
}


if (!auth.hostname || !auth.port || !auth.username || !auth.password) {
    console.log('DEPLOY: check authentification for', APP_NAME, 'auth', JSON.stringify(auth));
    process.exit(0);
}

var ftpConfig = {
    username: auth.username,
    password: auth.password,
    host: auth.hostname,
    port: auth.port || 21,
    localRoot: process.cwd() + "/dist-production",
    remoteRoot: "/" + ((config.deploy.ftp.remoteRoot) ? config.deploy.ftp.remoteRoot + '/' : ''),
    exclude: ['.git', '.idea', 'tmp/*', 'vendor']
}



try {

    upload();
}
catch (err) {
    console.log('WARN: Deploy error', JSON.stringify(err));
}

function ensureFolders() {
    utils.ensureDirectory(path.join(process.cwd(), 'dist-production'));
    utils.ensureDirectory(path.join(process.cwd(), 'dist-production', 'files'));
}



function upload() {

    //console.log('DEPLOY: ftp configuration', ftpConfig);
    ensureFolders();

    console.log('DEPLOY: Upload starting');

    var ftpDeploy = new FtpDeploy();
    ftpDeploy.on('upload-error', function(data) {
        console.log('DEPLOY: debug-deploy-error', data.err); // data will also include filename, relativePath, and other goodies
    });

    ftpDeploy.on('uploading', function(data) {
        //data.totalFileCount; // total file count being transferred
        //data.transferredFileCount; // number of files transferred
        //data.percentComplete; // percent as a number 1 - 100
        //data.filename; // partial path with filename being uploaded
        //console.log('deploy', data.filename, data.percentComplete + ' %', data.transferredFileCount + '/' + data.totalFileCount);
    });
    ftpDeploy.on('uploaded', function(data) {
        //console.log(data); // same data as uploading event
        console.log('DEPLOY: ', data.filename, 'uploaded');
    });


    ftpDeploy.deploy(ftpConfig, function(err) {
        if (err) console.log(JSON.stringify(err))
        else {
            console.log('DEPLOY: Success');

            if (process.env.DEPLOY_PRESERVE_FILES && process.env.DEPLOY_PRESERVE_FILES.toString() == '1') {
                onUploadSuccess();
            }
            else {
                console.log('DEPLOY: deleting file');
                utils.deleteFiles([g.dest + '/**/*.*']).then(() => {
                    utils.deleteFiles([g.dest]).then(onUploadSuccess);
                });
            }



            function onUploadSuccess() {
                if (configUploaded) {

                    co(function*() {

                        yield inspectPublishedConfiguration();
                        console.log('DEPLOY: End');
                        process.exit(0);

                    }).catch(function(err) {
                        console.error(err);
                    });
                }
                else {
                    generateConfig();
                    configUploaded = true;
                    console.log('DEPLOY: sleep 3 seconds');
                    setTimeout(function() {
                        ensureFolders();
                        upload();
                    }, 3000);
                }
            }


        }

    });

}

function* inspectPublishedConfiguration() {
    if (!process.env.FTP_PUBLIC_URL) return console.log('Set FTP_PUBLIC_URL to watch the published configuration.');
    // You can also pass options object, see http://github.com/mikeal/request docs
    let result = yield request({
        uri: process.env.FTP_PUBLIC_URL + 'files/config.json',
        method: "GET"
    });
    // let response = result;
    let body = result.body;
    // console.log("Response: ", response);
    console.log("DEPLOY: Published config", body);
}

function generateConfig() {
    var config = {
        API_ENDPOINT: process.env.API_ENDPOINT || 'http://shopmycourses.herokuapp.com/',
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '979481548722-mj63ev1utfe9v21l5pdiv4j0t1v7jhl2.apps.googleusercontent.com',
        TEST: 1
    };
    utils.ensureDirectory(path.join(process.cwd(), 'dist-production'));
    utils.ensureDirectory(path.join(process.cwd(), 'dist-production', 'files'));
    console.log('DEPLOY: Expected config', JSON.stringify(config));
    fs.writeFileSync(path.join(process.cwd(), 'dist-production', 'files', 'config.json'), JSON.stringify(config), 'utf8');
}
