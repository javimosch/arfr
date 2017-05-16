var path = require('path');
var resolver = require(path.join(process.cwd(), 'lib/resolver'));
exports.configure = function(app) {
    
    app.post('/api/:controller/:action', resolver.backendRouter().handleControllerAction());
    
    //api/meetful/
    //resolver.backendRouter().group('meetful',(router)=>{
        //api/meetful/user/login
        //router.post('user/login', resolver.ctrl().meetful.users.login);
    //});
    
};
