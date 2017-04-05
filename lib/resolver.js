var path = require('path');
require(path.join(process.cwd(), 'lib/config/env'));
module.exports = {
    database: () => {
        return require(path.join(process.cwd(), 'lib/database'));
    },
    logger: () => {
        return require(path.join(process.cwd(), 'lib/logger'));
    },
    generator: () => {
        return require(path.join(process.cwd(), 'lib/generator'));
    },
    generatorEntryPoint: () => {
        require(path.join(process.cwd(), 'lib/generator/entry_point'));
    },
    generatorTemplates: () => {
        require(path.join(process.cwd(), 'lib/generator/core/templates'));
    },
    middlewares: () => {
        return require(path.join(process.cwd(), 'lib/middlewares/middlewares'));
    },
    routes: () => {
        return require(path.join(process.cwd(), 'lib/routes/routes'));
    },
    backendDatabase: () => {
        return require(path.join(process.cwd(), 'backend/model/backend-database'));
    },
    backendRoutes: () => {
        return require(path.join(process.cwd(), 'backend/model/backend-routes'));
    },
    backendTasks: () => {
        return require(path.join(process.cwd(), 'backend/model/tasks'));
    },
    databaseControllers: () => {
        return require(path.join(process.cwd(), 'backend/model/backend-controllers-manager'));
    },
    handlebarsContext: () => {
        return require(path.join(process.cwd(), 'lib/config'));
    },
    env: () => {
        return require(path.join(process.cwd(), 'lib/config/env'));
    },
    generatorUtils: () => {
        return require(path.join(process.cwd(), 'lib/generator/core/utils'));
    },
    utils: () => {
        return require(path.join(process.cwd(), 'lib/utils/utils'));
    }
}
