var path = require('path');
var Promise = require('promise');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
function logger() {
    return resolver.logger().get('SERVER', 'DATABASE');
}
module.exports = {
    logger: logger,
    configure: () => {
        return resolver.coWrap(function*() {
            yield resolver.backendDatabase().configure();
            logger().debugTerminal('OK');
            yield resolver.ctrlManager().configure();
            logger().debug('CONTROLLERS:OK');
            return resolver.Promise.resolve(true);
        })();
    }
}
