/*global angular*/
import angular from 'angular';
import 'angular-route';
import angularSanatize from 'angular-sanitize';
import 'angular-spinner';
import spinnerConfig from '../config/spinner-config';
import manageUsers from '../controllers/manageUsers';
import {
    userTable
}
from '../controllers/manageUsers';
import {
    maquetteTable
}
from '../services/maquetteTable';
const appName = 'app';
export default {
    configure: (options) => {

        var dependencies = ['ngRoute', angularSanatize, 'angularSpinner'];
        if (options.dependencies) {
            dependencies = dependencies.concat(options.dependencies);

            dependencies = dependencies.filter(function(item, pos, self) {
                return self.indexOf(item) == pos;
            });
        }
        const mainModule = angular.module(appName, dependencies);

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

        mainModule.config(spinnerConfig());

        if (options.configBlocks) {
            options.configBlocks.forEach(config => mainModule.config(config));
        }

        mainModule.service(maquetteTable.name, maquetteTable.def);
        if (options.services) {
            options.services.forEach(service => mainModule.service(service.name, service.def));
        }

        mainModule.directive(userTable.name, userTable.def);
        if (options.directives) {
            options.directives.forEach(directive => mainModule.directive(directive.name, directive.def));
        }

        if (options.runBlocks) {
            options.runBlocks.forEach(run => mainModule.run(run));
        }

        mainModule.controller('manage-users', manageUsers())
        if (options.controllers) {
            options.controllers.forEach(def => mainModule.controller(def[0], def[1]()));
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
