(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global angular */

var configureAngular = require('./configs/config-angular').configure;
var configureFormly = require('./configs/config-formly').configure;

var configureAppModule = require('./ctrls/app-common-ctrls').configure;
var configureServiceModule = require('./ctrls/service-ctrls').configure;
var configureConnectModule = require('./ctrls/connect-ctrls').configure;
var configureProfileModule = require('./ctrls/profile-ctrls').configure;

//var parse = require('./srvs/parse-service').Service;

var app = angular.module('app', ['ngResource', 'ui.router', 'formly', 'formlyBootstrap', 'ui.bootstrap', 'ngMessages']);

configureAngular(app); //configuration
configureFormly(app); //configuration

configureAppModule(app); //controller
configureProfileModule(app); //controller
configureServiceModule(app); //controller
configureConnectModule(app); //controller

app.service('parse', () => {}); //service

},{"./configs/config-angular":3,"./configs/config-formly":4,"./ctrls/app-common-ctrls":6,"./ctrls/connect-ctrls":7,"./ctrls/profile-ctrls":8,"./ctrls/service-ctrls":9}],2:[function(require,module,exports){

var middlewares = require('./routes-middlewares').middlewares;

exports.routesConfiguration = ($stateProvider, $urlRouterProvider) => {
    $urlRouterProvider.otherwise('/home');

    $stateProvider.state('service-edit', {
        url: '/service/:id',
        templateUrl: './views/service-edit.html',
        params: {
            owner: null
        }
    });
    //onEnter: middlewares.inject(middlewares.SECURE)
    $stateProvider.state('services', {
        url: '/services',
        templateUrl: './views/service-list.html',
        onEnter: middlewares.inject(middlewares.SECURE)
    });

    $stateProvider.state('connect', {
        url: '/connect',
        templateUrl: './views/connect.html',
        onEnter: middlewares.inject(middlewares.JUMP_WHEN_LOGGED)
    });

    $stateProvider.state('profile', {
        url: '/profile',
        templateUrl: './views/profile.html',
        onEnter: middlewares.inject(middlewares.SECURE)
    });

    $stateProvider.state('user-services', {
        url: '/myservices',
        templateUrl: './views/user-services.html',
        onEnter: middlewares.inject(middlewares.SECURE)
    });

    $stateProvider.state('home', {
        url: '/home',
        templateUrl: './views/home.html',
        onEnter: middlewares.inject(middlewares.SESSION)
    });
    //    console.log('routeConfiguration');
};

},{"./routes-middlewares":5}],3:[function(require,module,exports){
/* global _ */
var routeConfiguration = require('./config-angular-routes').routesConfiguration;

exports.configure = app => {
    app.config(routeConfiguration);
};

//PARAMS
//($scope, parse, $stateParams, $timeout, $state, $rootScope)=>{}
var injectables = ['$scope', 'parse', '$stateParams', '$timeout', '$state', '$rootScope'];
exports.createController = handler => {
    var rta = _.clone(injectables);
    rta.push(handler);
    return rta;
};

},{"./config-angular-routes":2}],4:[function(require,module,exports){
exports.configure = app => {
    app.config(config);
    app.run(run);
};
var run = (formlyConfig, formlyValidationMessages) => {
    formlyConfig.extras.ngModelAttrsManipulatorPreferBound = true;
    formlyValidationMessages.addStringMessage('maxlength', 'Your input is WAAAAY too long!');
    formlyValidationMessages.messages.pattern = function (viewValue, modelValue, scope) {
        return viewValue + ' is invalid';
    };
    formlyValidationMessages.addTemplateOptionValueMessage('minlength', 'minlength', '', 'is the minimum length', 'Too short');
};
var config = formlyConfigProvider => {

    formlyConfigProvider.setType([{
        name: 'input',
        templateUrl: 'input-template.html',
        overwriteOk: true
    }, {
        name: 'checkbox',
        templateUrl: 'checkbox-template.html',
        overwriteOk: true
    }]);
    formlyConfigProvider.setWrapper([{
        template: ['<div class="formly-template-wrapper form-group"', 'ng-class="{\'has-error\': options.validation.errorExistsAndShouldBeVisible}">', '<label for="{{::id}}">{{options.templateOptions.label}} {{options.templateOptions.required ? \'*\' : \'\'}}</label>', '<formly-transclude></formly-transclude>', '<div class="validation"', 'ng-if="options.validation.errorExistsAndShouldBeVisible"', 'ng-messages="options.formControl.$error">', '<div ng-messages-include="validation.html"></div>', '<div ng-message="{{::name}}" ng-repeat="(name, message) in ::options.validation.messages">', '{{message(options.formControl.$viewValue, options.formControl.$modelValue, this)}}', '</div>', '</div>', '</div>'].join(' ')
    }, {
        template: ['<div class="checkbox formly-template-wrapper-for-checkboxes form-group">', '<label for="{{::id}}">', '<formly-transclude></formly-transclude>', '</label>', '</div>'].join(' '),
        types: 'checkbox'
    }]);
};

},{}],5:[function(require,module,exports){
var middlewares = {
    SECURE: ['redirectVisitorsWithoutSession', 'sessionUpdate'],
    JUMP_WHEN_LOGGED: ['whenSessionJumpToProfile'],
    SESSION: ['sessionUpdate'],
    whenSessionJumpToProfile: ($state, $timeout, sparse) => {
        if (sparse.Parse.User.current() && sparse.Parse.User.current().authenticated()) {
            sparse.Parse.Session.current().then(() => {
                $timeout(() => {
                    $state.go('profile');
                });
            });
        }
    },
    sessionUpdate: ($state, $timeout, sparse) => {
        sparse.Parse.Session.current().fail(() => {
            sparse.Parse.User.logOut().always(() => {
                //if session lost, logout.
            });
        });
    },
    redirectVisitorsWithoutSession: ($state, $timeout, sparse) => {
        sparse.Parse.Session.current().fail(() => {
            $timeout(function () {
                $state.go('connect', { sessionExpired: true });
            });
        });
    },
    inject: _middlewareNames => {
        var middleware = ($state, $timeout, parse) => {
            _middlewareNames.forEach(k => {
                middlewares[k]($state, $timeout, parse);
            });
        };
        return ['$state', '$timeout', 'parse', middleware];
    }
};
exports.middlewares = middlewares;

},{}],6:[function(require,module,exports){
/* global Parse */
var create = require('../configs/config-angular').createController;
exports.configure = app => {
    app.controller('main', create(main));
};

var main = function ($scope, parse, $stateParams, $timeout, $state, $rootScope) {
    //injects
    var root = $rootScope;

    root.goto = (name, params) => {
        //console.info('goto ',name,params);
        $state.go(name, params);
    };

    root.statusLogged = () => {
        return Parse.User.current() && Parse.User.current().authenticated();
    };

    root.state = {
        saving: false,
        success: '',
        warning: ''
    };

    root.toggleState = (stateVarName, val, nextVal, timeout) => {
        root.state[stateVarName] = val;
        if (nextVal === undefined && timeout === undefined) return;
        if (timeout < 500) timeout = 500;
        $timeout(() => {
            root.$apply();
        });
        $timeout(() => {
            nextVal = nextVal == undefined ? root.state[stateVarName] : nextVal;
            root.state[stateVarName] = nextVal;
            root.$apply();
        }, timeout);
    };

    root.stateName = () => {
        return $state.current.name;
    };

    root.question = msg => {
        return window.confirm(msg);
    };

    root.currentUser = () => {
        return Parse.User.current();
    };
};

},{"../configs/config-angular":3}],7:[function(require,module,exports){
/* global Parse */
/* global _ */
var create = require('../configs/config-angular').createController;
exports.configure = app => {
    app.controller('connect', create(connect));
};
var connect = function ($scope, parse, $stateParams, $timeout, $state, $rootScope) {
    //injects
    var root = $rootScope;
    var vm = this;
    vm.model = {};
    vm.fields = [{
        key: 'email',
        type: 'input',
        templateOptions: {
            label: 'Email',
            placeholder: 'Email',
            required: true,
            type: 'email'
        }
    }, {
        key: 'pass',
        type: 'input',
        templateOptions: {
            label: 'Password',
            placeholder: 'Password',
            required: true,
            type: 'password'
        }
    }];

    vm.disconnect = () => {
        Parse.User.logOut().then(function () {
            root.goto('home');
        });
    };

    $scope.onLogin = () => {
        //        console.log(vm.model);
        Parse.User.logIn(vm.model.email, vm.model.pass).then(function () {
            $state.go('profile', {});
        }).fail(function (a) {
            $scope.warning = a.message;
            console.warn('error', a);
            $timeout(() => $scope.$apply());
        });
    };

    $scope.onRegister = () => {
        Parse.User.signUp(vm.model.email, vm.model.pass).then(function (a, b, c) {
            console.info(a, b, c);
        }).fail(function (a) {
            $scope.warning = a.message;
            console.warn('error', a);
            $timeout(() => $scope.$apply());
        });
    };

    $timeout(() => $scope.$apply(), 2000);
};

},{"../configs/config-angular":3}],8:[function(require,module,exports){
/* global Parse */
/* global _ */
var create = require('../configs/config-angular').createController;

exports.configure = app => {
    app.controller('profileGeneral', create(general));
    app.controller('profileDetails', create(details));
    app.controller('profileServices', create(services));
};

var services = function ($scope, parse, $stateParams, $timeout, $state, $rootScope) {
    //injects
    var c = this;
    c.active = 0;
    c.services = [{
        description: 'Web design'
    }, {
        description: 'Programming'
    }];

    //fetch
    var columns = ['description', 'price'];
    parse.Query('Service').equalTo('owner', Parse.User.current()).select(columns).find().then(function (r) {
        c.services = parse.Data(r, columns);
        $timeout(() => $scope.$apply());
    });

    c.select = index => {
        if (index.toString() === '+1') {
            c.active++;
        } else if (index.toString() === '-1') {
            c.active--;
        } else {
            c.active = index;
        }
    };
};

var general = function ($scope, parse, $stateParams, $timeout, $state, $rootScope) {
    //injects

    var c = this;
    c.user = Parse.User.current();
    c.model = parse.Data([c.user], ['nick'])[0];

    var update = setInterval(function () {
        var data = parse.Data([c.user], ['nick'])[0];

        //console.log(c.model, data);

        if (_.differenceWith([data], [c.model], _.isEqual).length !== 0) {
            $rootScope.toggleState('saving', 'Saving..', '', 9999);
            $timeout(() => $scope.$apply());
            parse.Instance('User', c.model, c.user).save().then(function () {
                $timeout(() => {
                    $rootScope.toggleState('saving', '', '', 0);
                    $scope.$apply();
                }, 500);
            });
        }
    }, 2000);
    $scope.$on('$destroy', () => {
        clearInterval(update);
    });
};

var details = function ($scope, parse, $stateParams, $timeout, $state, $rootScope) {
    //injects
    var root = $rootScope;
    var vm = this;
    vm.model = {};
    vm.fields = [{
        key: 'firstName',
        type: 'input',
        templateOptions: {
            label: 'First Name',
            type: 'text',
            required: false
        }
    }, {
        key: 'lastName',
        type: 'input',
        templateOptions: {
            label: 'Last Name',
            type: 'text',
            required: false
        }
    }, {
        template: "<hr/>"
    }, {
        key: 'email',
        type: 'input',
        templateOptions: {
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: 'example@example.com'
        }
    }, {
        key: 'password',
        type: 'input',
        templateOptions: {
            label: 'Password',
            placeholder: 'Password',
            required: true,
            type: 'password',
            value: '123456'
        }
    }];

    Parse.User.current().fetch().then(r => {
        vm.model = Object.assign(parse.Data([r], ['username', 'email', 'lastName', 'firstName'])[0], {
            password: '123456'
        });
        vm.original = _.clone(vm.model);
    });

    vm.changed = () => {
        if (!vm.original) return false;
        return _.differenceWith([vm.original], [vm.model], _.isEqual).length !== 0;
    };

    vm.save = () => {

        $rootScope.toggleState('saving', 'Saving..');
        parse.Instance('User', vm.model, Parse.User.current()).save().then(() => {
            $rootScope.toggleState('saving', '');
            $rootScope.toggleState('saving', 'Saved !', '', 2000);
        });

        if (vm.original.password !== vm.model.password) {
            if (root.question("If you change the password you will need to re-login using the new password right after press 'OK'")) {
                changePassword(vm.model.password);
            }
        }
    };

    function changePassword(password) {
        Parse.User.current().setPassword(password);
        $rootScope.toggleState('saving', 'Saving..', '', 9999);
        Parse.User.current().save().then(() => {
            $rootScope.toggleState('success', 'Password changed!', '', 1000);
            $rootScope.toggleState('saving', '', '', 9999);
            $timeout(() => {
                Parse.User.logOut().then(() => {
                    root.goto('connect', { passwordChanged: true });
                });
            });
        });
    }
};

},{"../configs/config-angular":3}],9:[function(require,module,exports){
/* global _ */
var create = require('../configs/config-angular').createController;

exports.configure = app => {
    app.controller('serviceEdit', create(edit));
    app.controller('services', create(list));
};

var list = function ($scope, parse, $stateParams, $timeout, $state, $rootScope) {
    //injects
    var root = $rootScope;
    var owner = Parse.User.current().id;
    var vm = this;
    vm.collection = [];

    root.toggleState('loading', 'Loading..');
    parse.Query('Service').equalTo('owner', Parse.User.current()).find().then(function (r) {
        vm.collection = parse.Data(r, ['description', 'price', 'objectId']);
        root.toggleState('loading', '');
        $timeout(() => $scope.$apply());
    });

    vm.onItemTap = item => {
        root.goto('service-edit', { id: item.id, owner: owner });
    };
    vm.onNew = () => {
        root.goto('service-edit', { owner: owner });
    };
};

var edit = function ($scope, parse, $stateParams, $timeout, $state, $rootScope) {
    //injects
    var params = $stateParams;
    var root = $rootScope;
    var owner = params.owner;

    var vm = this;
    vm.model = {};
    vm.originalModel = {};
    vm.fields = [{
        key: 'id',
        type: 'input',
        templateOptions: {
            label: 'Identifier',
            disabled: true
        }
    }, {
        key: 'description',
        type: 'input',
        templateOptions: {
            label: 'Description',
            placeholder: 'Write a description of your service',
            required: true
        }
    }, {
        key: 'price',
        type: 'input', templateOptions: {
            label: 'Price',
            required: true
        }
    }];

    //fetch
    if (!owner) {
        console.warn('service owner unknow.');
        root.goto('services');
    } else {
        parse.user.get(owner).then(ownerUser => {
            if (params.id) {
                $rootScope.toggleState('loading', 'Loading..');
                parse.Query('Service').equalTo('objectId', params.id).find().then(function (r) {
                    vm.instance = r[0];
                    vm.model = parse.Data(r, ['description', 'price'])[0];
                    vm.originalModel = _.clone(vm.model);
                    $rootScope.toggleState('loading', '');
                    $timeout(() => $scope.$apply());
                });
            }
            vm.model.owner = ownerUser;
        });
    }

    $scope.onSave = () => {
        $rootScope.toggleState('saving', 'Saving..');
        parse.Instance('Service', vm.model, vm.instance).save().then(function (r) {
            vm.model = parse.Data([r], ['description', 'price', 'owner'])[0];
            vm.originalModel = _.clone(vm.model);
            $rootScope.toggleState('saving', '');
            $timeout(() => $scope.$apply());
        });
    };

    $scope.onDelete = () => {
        if (window.confirm('sure?')) {
            $rootScope.toggleState('deleting', 'Deleting..');
            parse.Instance('Service', vm.model, vm.instance).destroy().then(function () {
                $rootScope.toggleState('deleting', '');
                $scope.onReturnClick();
            });
        }
    };

    $scope.unsaved = () => {
        return _.differenceWith([vm.model], [vm.originalModel], _.isEqual).length !== 0;
    };

    $scope.getReturnLabel = () => {
        if ($scope.unsaved()) {
            return "Cancel";
        } else {
            return 'Return';
        }
    };

    $scope.onReturnClick = () => {
        if ($scope.unsaved()) {
            vm.model = vm.originalModel;
        } else {
            $state.go('services');
        }
    };
};

},{"../configs/config-angular":3}],10:[function(require,module,exports){
require('./angular/app.angular');

},{"./angular/app.angular":1}]},{},[10])
//# sourceMappingURL=app.js.map
