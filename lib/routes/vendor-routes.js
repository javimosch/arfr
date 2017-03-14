var path = require('path');
module.exports = {
    bind: (app, express) => {
        app.use('/vendor', express.static(path.join(process.cwd(), 'vendor')));
        app.use('/bower', express.static('./bower'));
    }
};
