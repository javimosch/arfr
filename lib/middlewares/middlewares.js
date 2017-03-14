module.exports = {
    configure: (app, express) => {
        require('./cors-middleware').bind(app);
        require('./parsers-middlewares').bind(app);
    }
}
