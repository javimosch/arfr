module.exports = {
    bind: (app) => {
        app.all('*', function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-PUSH");
            if ('OPTIONS' == req.method) {
                return res.send(200);
            }
            next();
        });
    }
};
