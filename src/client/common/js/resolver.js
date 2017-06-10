import co from "co";
import appModule from './modules/app-module';
import dbService from './services/database/db';
import resolverService from './services/resolverService';
import notifyService from './services/notifyService';
import sessionService from './services/sessionService';
import configureCommonApiControllers from './run/configureCommonApiControllers';
export default {
    co: co,
    coWrapExec: (fn) => co.wrap(fn)(),
    coWrap: (fn) => co.wrap(fn),
    angularModules: {
        appModule: appModule
    },
    angularServices: {
        db: dbService,
        resolverService: resolverService,
        notifyService: notifyService,
        sessionService: sessionService
    },
    angularRunBlocks: {
        configureCommonApiControllers: configureCommonApiControllers
    },
    Promise: Promise
};
