var path = require("path");
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
const Promise = require('promise');

function configure(app) {
    return new Promise(function(resolve, reject, emit) {
        var logger = resolver.logger().get('SERVER','BACKEND-GENERAL');
        resolver.backendRoutes().configure(app).then(() => {
        
            logger.debugTerminal('Guessing temp folder name');
            var tempFolderPath = process.env.tempFolderPath || '/backend/temp/';
            logger.debugTerminal('Ensuring temp directory');
            try{
                resolver.utils().ensureDirectory(process.cwd() + tempFolderPath);
            }catch(err){
                logger.warn('Temp directory issue',err,'Path',process.cwd() + tempFolderPath);
            }
            
            logger.debugTerminal('Running programmed tasks');
            resolver.backendTasks().configure(app);
            resolve();
            
        }).catch(err=>{
            logger.error('Unable to set routes',err);
        });
    });
}
exports.configure = configure;
