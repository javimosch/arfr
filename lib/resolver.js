var path = require('path');
var Promise = require('promise');
var co = require('co');
var delay = require('timeout-as-promise');
require(path.join(process.cwd(), 'lib/config/env'));
var CONSTANTS = require(path.join(process.cwd(), 'lib/constants'));
var self = {
    pathTo: (relativePath,joinPath) => path.join(process.cwd(), relativePath,joinPath||''),
    backendDatabase: () => {
        return require(path.join(process.cwd(), 'lib/backend/database/backend-database'));
    },
    model:()=>self.backendDatabase().model,
    backendRouter: () => {
        return require(path.join(process.cwd(), 'lib/backend/backend-router'));
    },
    backendRoutes: () => {
        return require(path.join(process.cwd(), 'src/server/routes'));
    },
    backendTasks: () => {
        return require(path.join(process.cwd(), 'backend/model/tasks'));
    },
    delay: (milliseconds) => delay(milliseconds),
    mongoose: () => require('mongoose'),
    gfs: () => self.db().state().gfs,
    promise: (handler) => new Promise(handler),
    Promise: Promise,
    http: () => require('request'),
    _: () => require('lodash'),
    co: (handler) => co(handler),
    coWrap: (handler) => co.wrap(handler),
    coWrapExec: (handler) => co.wrap(handler)(),
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
        return require(path.join(process.cwd(), 'lib/generator/entry_point'));
    },
    generatorTemplates: () => {
        return require(path.join(process.cwd(), 'lib/generator/core/templates'));
    },
    middlewares: () => {
        return require(path.join(process.cwd(), 'lib/middlewares/middlewares'));
    },
    routes: () => {
        return require(path.join(process.cwd(), 'lib/routes/routes'));
    },
    ctrl: () => {
        return require(path.join(process.cwd(), 'lib/backend/database/backend-controllers-manager')).getAll();
    },
    ctrlManager: () => {
        return require(path.join(process.cwd(), 'lib/backend/database/backend-controllers-manager'));
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
    generatorBags:()=>{
          return require(path.join(process.cwd(), 'lib/generator/core/bags'));
    },
    utils: () => {
        return require(path.join(process.cwd(), 'lib/utils/utils'));
    },
    getFacade: (relativePath) => {
        return require(path.join(process.cwd(), 'lib/facades/' + relativePath + '-facade'));
    },
    CONSTANT: () => CONSTANTS,
    require: (relativePath, joinPart) => {
        return require(path.join(process.cwd(), relativePath, joinPart || undefined));
    },
    clientFolder:function(){
        var arr = Array.prototype.slice.call(arguments);
        arr.unshift(path.join(process.cwd(),self.CONSTANT().SRC_CLIENT_PATH,self.env().APP_NAME));
        return path.join.apply(path,arr);
    }
};
module.exports = self;
