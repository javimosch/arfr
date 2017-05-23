/*global angular*/
import angular from 'angular';
const appName = 'app';
export default {
    configure: (options) => {
        angular.module(appName, ['ngRoute']).controller('appController', function($log) {
            $log.info('app-controller');
        });

        if (options.routes) {
            angular.module(appName).config(['$routeProvider', '$locationProvider',
                function($routeProvider, $locationProvider) {

                    options.routes.forEach(route => {
                        if (route[0] == 'default') {
                            $routeProvider.otherwise({
                                redirectTo: route[1]
                            });
                        }
                        else {
                            $routeProvider.
                            when(route[0], {
                                templateUrl: route[1]
                            });
                        }
                    });

                    $locationProvider.html5Mode({
                        enabled: true,
                        requireBase: false
                    });
                }
            ]);
        }

    },
    bootstrap: () => {
        return new Promise((resolve, reject) => {
            angular.element(function() {
                console.log('Bootstraping...');
                angular.bootstrap(document, [appName]);
                resolve();
            });
        });
    }
}
