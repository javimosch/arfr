var Promise = require('promise');
var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));

function logger() {
    return resolver.logger().get('GENERATOR', 'INDEX');
}
module.exports = {
    logger: logger,
    configure: () => resolver.coWrapExec(function*() {
        //logger().debugTerminal('Running');
        yield resolver.generatorEntryPoint().configure();
        return yield resolver.Promise.resolve(true);
    })
};
