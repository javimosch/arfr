/*global moment*/
/*global angular*/
/*global $U*/
/*global SS*/
angular.module('ssg_run', []).run(['server', '$timeout', '$rootScope', function(db, $timeout, r) {
    //diags
    moment.locale('en')

    r.defaults.userCollectionName = 'User';

    $U.readJSONAsync(SS.ROOT + 'files/config.json').then((config) => {
        r.config = config;
        $U.req('/config').then(res => {
            if (typeof res == 'string') res = JSON.parse(window.atob(res));
            try {
                var config = JSON.parse(window.atob(res.config));
                Object.assign(r.config, config);

                if (SS && SS.PROD == true && r.config.serverURL_PROD && !r.config.serverURL) {
                    r.config.serverURL = r.config.serverURL_PROD;
                }
                if (SS && SS.PROD == false && r.config.serverURL_DEV && !r.config.serverURL) {
                    r.config.serverURL = r.config.serverURL_DEV;
                }

                $U.emitPreserve("config_up", r.config);
            }
            catch (e) {
                console.warn('Problems to retrieve server configuration.');
            }
        });
    });

    r.isDevEnv = () => {
        return window.location.origin.indexOf('maerp-javoche') !== -1;
    };


    r.MODULE = {
        DASHBOARD:'',
        CONFIGURATION: 'configuration',
        DEVICE: 'device'
    };
   

}]);
