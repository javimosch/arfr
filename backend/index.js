var path = require("path");
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
const Promise = require('promise');

function configure(app) {
    return new Promise(function(resolve, reject, emit) {
        var logger = resolver.logger().get('SERVER','BACKEND-GENERAL');
        resolver.backendRoutes().configure(app).then(() => {
        
            var tempFolderPath = process.env.tempFolderPath || '/backend/temp/';
            resolver.utils().ensureDirectory(process.cwd() + tempFolderPath);
            
            logger.debug('Running programmed tasks');
            resolver.backendTasks().configure(app);
            resolve();
        }).catch(err=>{
            logger.error('Unable to set routes',err);
        });
    });
}
exports.configure = configure;
