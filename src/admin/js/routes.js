(function() {
    /*global angular*/
    angular.module('routes', []).config(['$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {
            $routeProvider.
            when('/', {
                templateUrl: '/includes/default.html'
            }).
            otherwise({
                redirectTo: '/'
            });

            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });
        }
    ]);
})();
