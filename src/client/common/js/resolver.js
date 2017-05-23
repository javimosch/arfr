import co from "co";
import appModule from './modules/app-module';
export default {
    co: co,
    angularModules: {
        appModule: appModule
    },
    log: (s) => console.log('s')
};
