var Handlebars = require('handlebars');
var path = require("path");
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var logger = resolver.logger().get('FACADE', 'HBS');
var urldecode = require('urldecode');

var registeredNames = [];
function registerPartial(name,contents){
    if(registeredNames.indexOf(name)!==-1){
        return logger.errorTerminal(name,'Already registered');
    }
    registeredNames.push(name);
    Handlebars.registerPartial(name, contents);
    logger.debugTerminal('Registered', "'"+name+"'");
}

var self = module.exports = {
    registerPartialFromFile: (name, absolutePath) => {
        return resolver.coWrapExec(function*() {
            logger.debugTerminal('Reading', name, absolutePath);
            var contents = yield resolver.getFacade('fs').readFile(absolutePath);
            yield self.registerPartial(name, contents);
            return resolver.Promise.resolve(true);
        });
    },
    registerPartial: (name, contents) => {
        return resolver.coWrapExec(function*() {
            contents = urldecode(contents);
            registerPartial(name,contents);
            if (name.indexOf("-partial") !== -1) {
                registerPartial(name.replace('-partial', ''), contents);
            }
            return resolver.Promise.resolve(true);
        });
    },
    compile: (contents, data) => {
        return Handlebars.compile(contents)(resolver.handlebarsContext().assign(data || ''));
    }
};
