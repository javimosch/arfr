var Promise = require('promise');
var resolver = require('./resolver');
function logger() {
    return resolver.logger().get('SERVER', 'GENERATOR');
}
module.exports = {
    logger: logger,
    configure: (app) => {
        return new Promise((resolve, reject) => {
            resolver.databaseControllers().texts.getAllByCategory('i18n').then(_texts => {
                var i18n = {};
                for (var x in _texts) {
                    i18n[_texts[x].code] = _texts[x].content;
                }
                resolver.handlebarsContext()({
                    i18n: Object.assign(resolver.handlebarsContext()().i18n || {}, i18n)
                });
                logger().debug('Running');
                resolver.generatorEntryPoint();
                //logger().debug(Object.keys(resolver.handlebarsContext()())); //hbs config keys
                resolve();
            }).catch(reject);
        });
    }
};
