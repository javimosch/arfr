"use strict";
import "babel-polyfill";
import resolver from "../../common/js/resolver";
import loginController from './auth/login-controller';
import createClientAccount from './auth/create-client-account';
import clientDashboard from './dashboard/client-dashboard';
resolver.co.wrap(function*() {
    //Configuration phase
    resolver.angularModules.appModule.configure({
        dependencies: [
            'ngNotify'
        ],
        routes: [
            ['/clients', "/includes/login-form.html"],
            ['/create-account', "/includes/create-client-account.html"],
            ['/dashboard', "/includes/client-dashboard.html"],
            ['/manage-users', "/includes/manage-users.html"],
            ['default', '/clients']
        ],
        controllers: [
            ['login', loginController],
            ['create-client-account', createClientAccount],
            ['client-dashboard', clientDashboard]
        ],
        services: [
            resolver.angularServices.db(),
            resolver.angularServices.resolverService(),
            resolver.angularServices.notifyService(),
            resolver.angularServices.sessionService()
        ],
        runBlocks: [
            resolver.angularRunBlocks.configureCommonApiControllers(), ['ngNotify', function(ngNotify) {
                //https://github.com/matowens/ng-notify
                ngNotify.config({
                    theme: 'pastel',
                    position: 'bottom',
                    duration: 4000,
                    type: 'info',
                    sticky: false,
                    button: true,
                    html: true
                });
            }]
        ],
        directives: [{
            name: "dbState",
            def: ['$db', '$log', '$timeout', function($db, $log, $timeout) {
                return {
                    restrict: "A",
                    scope: true,
                    template: "<input ng-model='pendingTransactions'>",
                    link: function(scope, element, attr) {
                        scope.pendingTransactions = 0;
                        setInterval(function() {
                            scope.pendingTransactions = $db.getRequests();
                            $timeout(() => scope.$apply());
                        }, 100);
                    }
                };
            }]
        }]
    });
    //Boostrap
    yield resolver.angularModules.appModule.bootstrap();
    return Promise.resolve('Bootstrap success');
})().then(console.info).catch(resolver.errorHandler(console.error));
