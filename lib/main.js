var heStyles = require('./core/styles');
var heScripts = require('./core/scripts');
var heTpls = require('./core/templates');
var heUtils = require('./core/utils');
var heConfig = require('./config');
var heFirebase = require('./core/firebase');
var heRes = require('./core/resources');
var heCommon = require('./core/common');
var PROD = process.env.PROD && process.env.PROD.toString() == '1' || false;
var g = {
    dest: 'dist',
    src: './src/',
    fileDependencies: {}
};
exports.load = {
    dataFromRequire: heTpls.dataFromRequire,
    data: heTpls.loadData,
    json: heTpls.loadJSON
};

exports.options = {
    setApp: setApp,
    dest: (dest, destProduction) => {
        heConfig({
            dest: dest,
            dest_production: (destProduction || (dest + '-production'))
        });
        g.dest = dest;
        heStyles.dest(dest);
        heScripts.dest(dest);
        heTpls.dest(dest);
    }
};

exports.watch = {
    templates: () => {
        heTpls.on('build-success', () => heFirebase.sendSignal('reload', {
            full_reload: true
        }));


        heTpls.on('file-dependency', (path) => {
            if (!g.fileDependencies[path]) {
                g.fileDependencies[path] = true;
                path = path.replaceAll('//', '/');
                if (path.indexOf('vendor') != -1) return;
                //console.log('ss debug watch ', path);
                heUtils.watch([path], () => heFirebase.sendSignal('reload', {
                    full_reload: true
                }));
            }
        });

        heRes.watch();
        heCommon.watch();

        heTpls.watch();
    },
    styles: () => {
        heStyles.on('build-success', (payload) => {

            heFirebase.sendSignal('reload', payload);

            if (!PROD) {
                //Dev mode inject each css file separately, so on css change, template must also build.
                heTpls.build().then(() => {});
            }

        });
        heStyles.watch();
    },
    scripts: () => {
        heScripts.on('build-success', () => {
            heFirebase.sendSignal('reload', {
                full_reload: true
            })

            if (!PROD) {
                //Dev mode inject each script separately, so on script change, template must also build.
                heTpls.build().then(() => {});
            }

        });
        heScripts.watch();
    }
};

exports.build = {
    //clean: clean,
    all: build
};

function clean() {
    return new Promise((resolve, err) => {
        heUtils.deleteFiles([g.dest + '/**/*.*']).then(() => {
            heUtils.deleteFiles([g.dest]).then(() => {
                resolve();
            });
        });
    })
}

function build() {
    return new Promise((resolve, error) => {
        //heUtils.clear(heConfig().outputBaseDir(), ['**']);
        heUtils.clear(heConfig().output(), ['**']);
        setTimeout(function() {

            //console.log('DEBUG: MAIN Build JS ');

            heScripts.build();

            //console.log('DEBUG: MAIN Build JS OK');

            heStyles.build();
            heTpls.build().then(() => {
                //console.log('DEBUG: main build all success at ' + new Date());
                resolve();
            });
        }, 500);
    });
}


function setApp(appName) {
    appData = {};
    appData.appName = appName;

    //console.log('LOG config '+JSON.stringify(appData));

    appData = heConfig(appData);

    heScripts.path(g.src + appName + '/js');
    heStyles.path(g.src + appName + '/css');
    heTpls.loadData(appData);
    heFirebase.init(appData);
    heTpls.pathPartials(g.src + appName + '/partials');
    heTpls.pathStatic(g.src + appName + '/static');
    //console.log('DEBUG: Config loaded [' + appName + ']');
}
