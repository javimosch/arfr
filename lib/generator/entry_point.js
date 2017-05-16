var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var heBuild = require('./main').build;
var heWatch = require('./main').watch;
var heOptions = require('./main').options;
var heFirebase = require('./core/firebase');
var heUtils = require('./core/utils');
const APP_NAME = resolver.env().APP_NAME;
heUtils.ensureDirectory(process.cwd() + '/dist');
heUtils.ensureDirectory(process.cwd() + '/dist-production');
heOptions.setApp(APP_NAME);
heOptions.dest('dist', 'dist-production');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
var heConfig = resolver.handlebarsContext();
var logger = resolver.logger().get('SERVER','GENERATOR-ENTRY');
logger.debugTerminal('CURRENT APP_NAME ->', APP_NAME);
logger.debugTerminal('outputLanguageFolder', heConfig().outputLanguageFolder());
logger.debugTerminal('outputBaseDir', heConfig().outputBaseDir());
logger.debugTerminal('output', heConfig().output());

logger.debugTerminal('BUILDER: BUILD-START');
heBuild.all().then(() => {
  logger.debugTerminal('BUILDER: BUILD-SUCCESS');
  heFirebase.sendSignal('reload', {
    full_reload: true
  });
  heWatch.templates();
  heWatch.scripts();
  heWatch.styles();
}).catch((err) => {
  logger.error('BUILDER: BUILD-FAIL', err);
});
