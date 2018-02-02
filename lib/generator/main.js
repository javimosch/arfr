var Promise = require('promise');
var _ = require('lodash');
var heStyles = require('./core/styles');
var heScripts = require('./core/scripts');
var heTpls = require('./core/templates');
var heUtils = require('./core/utils');
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var heConfig = resolver.handlebarsContext();
var heFirebase = require('./core/firebase');
var PROD = resolver.env().PROD;
var MULTILANG = process.env.MULTILANG && process.env.MULTILANG.toString() == '1' || false;
var logger = resolver.logger().get('GENERATOR', 'MAIN');
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

        heTpls.on('build-success', (opt) => {
            if (opt && opt.wasHotReload) {

            }
            else {
                heFirebase.sendSignal('reload', {
                    full_reload: true
                });
            }
        });


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




        heTpls.watch();
    },
    styles: () => {
        heStyles.on('build-success', (payload) => {

            heFirebase.sendSignal('reload', payload);

            if (!PROD) {
                //Dev mode inject each css file separately, so on css change, template must also build.
                //heTpls.build().then(() => {});
            }

        });
        heStyles.watch();
    },
    scripts: () => {
        heScripts.on('build-success', (opt) => {

            if (opt && opt.wasHotReload) {

            }
            else {
                heFirebase.sendSignal('reload', {
                    full_reload: true
                });
            }


            if (!PROD && !resolver.env().ROLLUP) {
                //Dev mode inject each script separately, so on script change, template must also build.
                heTpls.build().then(() => {});
            }

        });
        heScripts.watch();
    }
};

exports.build = {
    //clean: clean,
    all: buildAll
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

function cbHell(quantity, cb) {
    return {
        next: () => {
            quantity--;
            if (quantity === 0) cb();
        }
    }
}

function iterateCompileWithNextLanguage(left, resolve, reject) {
    if (left.length == 0) {
        heConfig().setDefaultLanguage();
        console.log('BUILDER TEMPLATES BUILD START FOR ', heConfig().i18n_config.default, '(DEFAULT)');
        heTpls.build().then(() => {
            console.log('BUILDER TEMPLATES COMPILED TO (DEFAULT) ', heConfig().i18n_config.default);
            return resolve();
        }).catch(reject);
    }
    else {
        heConfig().setLanguage(left[0]);
        console.log('BUILDER TEMPLATES BUILD START FOR ', left[0]);
        heTpls.build().then(() => {
            console.log('BUILDER TEMPLATES COMPILED TO ', left[0]);
            left = left.slice(1);
            iterateCompileWithNextLanguage(left, resolve, reject);
        }).catch(reject);
    }
}

function buildTemplates() {
    return resolver.promise((resolve, reject) => {
        return resolver.co(function*() {
            var enableMULTILANG = PROD || MULTILANG;
            if (enableMULTILANG && heConfig().i18n_config && heConfig().i18n_config.languages) {
                var languages = heConfig().i18n_config.languages;
                var left = _.clone(languages);
                iterateCompileWithNextLanguage(left, resolve, reject);
            }
            else {
                heTpls.build().then(() => {
                    //console.log('DEBUG: main build all success at ' + new Date());
                    resolve();
                }).catch(reject);
            }
        }).catch(reject);
    });
}

function buildAll(opt) {
    opt = opt || {
        templates: true,
        scripts: true,
        styles: true
    };
    return new Promise((resolve, error, emit) => {
        heUtils.clear(heConfig().output(), ['**']);
        setTimeout(function() {
            return resolver.co(function*() {
                if (opt.scripts) {
                    yield heScripts.build();
                }
                else {
                    logger.debugTerminal('Build disabled: scripts');
                }
                heStyles.build();
                yield buildTemplates();
            }).then(resolve).catch(error);
        }, 500);
    });
}


function setApp(appName) {
    return resolver.coWrapExec(function*() {
        var appData = {};
        appData.appName = appName;
        appData = heConfig(appData);
        var baseFolder = path.join(g.src, 'client', appName);
        heScripts.path(path.join(baseFolder, '/js'));
        heStyles.path(path.join(baseFolder, '/css'));
        heTpls.loadData(appData);
        logger.debugTerminal('Settings firebase..');
        yield heFirebase.init(appData);
        logger.debugTerminal('Settings firebase.. OK');
        heTpls.pathPartials(path.join(baseFolder, '/partials'));
        heTpls.pathStatic(path.join(baseFolder, '/static'));
        return yield resolver.Promise.resolve(true);
    });
}
