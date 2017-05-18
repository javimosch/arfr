var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var controllers = resolver.ctrl();
var Promise = resolver.Promise;
var sander = require('sander');
var moment = require('moment');
var S = require('string');
var btoa = require('btoa')
var _ = require('lodash');
var modelName = 'text';
var path = require('path');
var logger = resolver.logger().get("CONTROLLER", "TEXTS");

module.exports = {
    setupMultilanguageTexts: setupMultilanguageTexts,
    i18nConfig: i18nConfig,
    getAllByCategory: getAllByCategory
};


function getAllByCategory(category, cb) {
    return resolver.coWrapExec(function*() {
        var arr = [];
        var cat = yield resolver.model().categories.findOne({
            code: category
        }).exec();
        if (cat) {
            var _texts = yield resolver.model().texts.find({
                _category: cat._id
            }).select("content code").exec();
            if (_texts) arr = _texts;
        }else{
           logger.warnTerminal('Category ',category,'not found');
        }
        return resolver.Promise.resolve(arr);
    });

}

function i18nConfig(data, cb) {
    if (!data.appName) return cb('appName required.');
    var _requirePath = path.join(process.cwd(), 'configs/config-' + data.appName);
    require.async(_requirePath, function(config) {
        if (config.i18n_config) {
            cb(null, config.i18n_config);
        }
        else {
            cb('i18n_config required inside project configuration file');
        }
    });
}

function setupMultilanguageTexts(data, cb) {
    //Grab i18n static text from app config, if any, and save to texts. i18n category required.

    if (!data.appName) return cb('appName required.');

    return controllers.categories.get({
        code: 'i18n'
    }, (err, _category) => {
        if (err) return cb(err);
        if (!_category) {
            return cb('i18n category required.');
        }
        var _requirePath = path.join(process.cwd(), 'configs/config-' + data.appName);
        require.async(_requirePath, function(config) {
            if (config.i18n) {
                var items = config.i18n;
                var left = Object.keys(config.i18n);
                saveIterator();

                function saveIterator() {
                    if (left.length == 0) {
                        cb(null, {
                            msg: "Setup complete"
                        });
                    }
                    else {
                        var code = left[0];
                        var item = items[code];
                        controllers.texts.save({
                            _category: _category._id,
                            code: code,
                            content: item,
                            descripcion: 'autogenerated i18n item',
                            __match: {
                                _category: _category._id,
                                code: code
                            }
                        }, (err, r) => {
                            if (err) return cb(err);
                            left = left.slice(1);
                            saveIterator();
                        });

                    }
                }
            }

        });
    });
}