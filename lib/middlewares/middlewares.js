module.exports = {
    configure: (app, express) => {
        require('./cors-middleware').bind(app);
    }
}
