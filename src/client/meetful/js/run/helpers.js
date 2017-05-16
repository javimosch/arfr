/*global angular*/
/*global $*/
/*global moment*/
/*global _*/
/*global $hasMouse*/

var app = angular.module('service-app-run-helpers', []);

var __SHARE_FUNCTIONS = {
    isDevEnv: () => {
        return window.location.hostname.indexOf('c9users.io') !== -1 || window.location.hostname.indexOf('localhost') !== -1 || window.location.hostname.indexOf('herokuapp') !== -1
    }
};

app.config(function($logProvider) {
    var enabled = __SHARE_FUNCTIONS.isDevEnv();
    console.info('$log is ', (enabled ? 'enabled' : 'disabled'));
    $logProvider.debugEnabled(enabled);
});

app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);


app.run(['$timeout', '$rootScope', 'appApi', 'i18n', function($timeout, r, appApi, i18n) {
    //    console.info('app.admin:run');
    r.isDevEnv = __SHARE_FUNCTIONS.isDevEnv;
    r.navShow = true;




    r.secureSection = function(_s) {
        _s.show = false;
        if (!r.logged()) {
            console.warn('secureSection:redirecting to login');
            r.route('/');
        }
        else {
            _s.show = true;
            //async update of the current user.
            appApi.ctrl('User', 'getById', r.session()).then(function(d) {
                if (d.ok && d.result) r.session(d.result);
            });
        }
    };

    r.handleSecurityRouteViolation = () => {
        r.route('dashboard');
        console.warn('SECURITY: YOU-DONT-BELONG-HERE');
    };



}]);

/*google analytic tracking */
app.run(['$rootScope', '$location', '$window', '$log',
    function($rootScope, $location, $window, $log) {
        $rootScope.$on('$routeChangeSuccess',
            function(event) {
                if (!$window.ga) {
                    return;
                }
                $log.debug('ga tracking to ' + $location.path());
                $window.ga('set', 'page', $location.path());
                $window.ga('send', 'pageview');
            });
    }
]);

app.run(['appApi', '$timeout', '$rootScope', 'appUtils', 'appSettings', function(appApi, $timeout, r, appUtils, appSettings) {
    window.r = r;

    r.debug = true;
    r.momentFormat = (d, f) => (moment(d).format(f));
    r.momentTime = (d) => moment(d).format('HH[h]mm');
    r.momentDateTime = (d) => moment(d).format('DD-MM-YY HH[h]mm');
    r.momentDateTimeWords = (d) => moment(d).format('[Le] dddd DD MMMM YY [à] HH[h]mm');
    r.momentDateTimeWords2 = (d) => moment(d).format('dddd DD MMMM YY [à] HH[h]mm');
    
    r.hasMouse = false;
    appUtils.hasMouse((v) => {
        r.hasMouse = v;
    });


}]);
