//THIS MODULE IS CALLED DURING DEVELOPMENT TO HANDLE GENERATOR

var resolver = require('./resolver');

var logger = resolver.logger().get('DEV:CLIENT', 'BOOTSTRAP');
if (!resolver.env().PROD) {
    resolver.coWrapExec(function*() {
        var logger = resolver.logger().get('DEV:CLIENT', 'BOOTSTRAP');
        logger.debugTerminal('GENERATOR:START');
        yield resolver.generator().configure();
        //yield resolver.generatorBags().configure(app);
        resolver.generator().logger().debugTerminal('GENERATOR:OK');
    }).catch(logger.errorTerminal);
}
else {
    logger.debugTerminal('GENERATOR:OFF');
}
