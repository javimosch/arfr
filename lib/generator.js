var Promise = require('promise');
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));

function logger() {
    return resolver.logger().get('SERVER', 'GENERATOR');
}
module.exports = {
    logger: logger,
    configure: ()=>resolver.coWrapExec(function*(app) {
        var _texts = yield resolver.ctrl().texts.getAllByCategory('i18n');
        logger().debugTerminal('i18n',_texts.length);
        var i18n = {};
        for (var x in _texts) {
            if (typeof _texts[x].content == 'string') {
                logger().warn('Text', _texts[x].code, 'Content is not an object', 'skip');
                continue;
            }
            i18n[_texts[x].code] = _texts[x].content;
        }
        resolver.handlebarsContext()({
            i18n: Object.assign(resolver.handlebarsContext()().i18n || {}, i18n)
        });
        logger().debugTerminal('Running');
        try{
            resolver.generatorEntryPoint();
        }catch(e){
            logger().error('Crash',e);
        }
        return resolver.Promise.resolve(true);
    })
};
