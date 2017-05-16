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
logger.debug('CURRENT APP_NAME ->', APP_NAME);
logger.debug('outputLanguageFolder', heConfig().outputLanguageFolder());
logger.debug('outputBaseDir', heConfig().outputBaseDir());
logger.debug('output', heConfig().output());

logger.debug('BUILDER: BUILD-START');
heBuild.all().then(() => {
  logger.debug('BUILDER: BUILD-SUCCESS');
  heFirebase.sendSignal('reload', {
    full_reload: true
  });
  heWatch.templates();
  heWatch.scripts();
  heWatch.styles();
}).catch((err) => {
  logger.debug('BUILDER: BUILD-FAIL', err);
});
