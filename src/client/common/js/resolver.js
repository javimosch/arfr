import co from "co";
import appModule from './modules/app-module';
import dbService from './services/database/db';
import resolverService from './services/resolverService';
import notifyService from './services/notifyService';
import sessionService from './services/sessionService';
import configureCommonApiControllers from './run/configureCommonApiControllers';
export default {
    errorHandler: (h) => (err) => h(err.stack ? err + ' STACK: ' + err.stack : err),
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
    Promise: Promise,
    expose: (n, v) => {
        if (window.location.href.indexOf('c9') !== -1 || window.location.href.indexOf('heroku') !== -1) {
            window[n] = v;
            console.info('Exposed', n);
        }
        else {
            console.warn('Exposed disable', n);
        }
    }
};
