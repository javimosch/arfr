/*global angular*/
(function() {

    var app = angular.module('service-app-notify', []);

    const NOTIFY_TEMPLATE_URL = '/includes/popups/notify.html'
    const ALERT_TEMPLATE_URL = './views/directives/directive.alert.html';

    app.directive('notify', ['$rootScope', '$timeout', 'appGui', 'appUtils', function($rootScope, $timeout, appGui, appUtils) {
        return {
            scope: {
                message: "@message",
                type: "@type",
                cls: "@cls",
                scroll: "=scroll",
                opt: "=opt",
                evts: "=evts",
                settings: "=settings"
            },
            restrict: 'AE',
            replace: true,
            templateUrl: NOTIFY_TEMPLATE_URL,
            link: function(scope, elem, attrs) {
                var r = $rootScope;
                var s = scope;

                // console.log('notify-directive');

                if (s.settings && typeof s.settings == 'string') {
                    var fixedJSON = s.settings.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
                    s.settings = JSON.parse(fixedJSON);
                }

                //            console.info('NOTIFY', s.settings);
                var fireEvent = (n) => {
                    if (s.evts) {
                        s.evts[n] = s.evts[n] || [];
                        s.evts[n].forEach((cb) => {
                            cb();
                        })
                    }
                };
                $timeout(function() {
                    scope.$apply(function() {
                        elem.find('.alert').addClass(scope.type || 'alert-danger');
                        if (scope.cls) {
                            elem.find('.alert').addClass(scope.cls);
                        }
                    });
                });
                scope.clickDismiss = () => {
                    if (s.settings && s.settings.clickDismissable === false) {
                        if (s.opt && !s.opt.clickDismissable) return;
                    }
                    scope.dismiss();
                };
                scope.dismiss = () => {



                    if (s.dismissed) return;
                    s.dismissed = true;
                    elem.find('.alert').alert('close');
                    elem.remove()
                    fireEvent('close');
                    if (scope.opt && scope.opt.onClose) {
                        scope.opt.onClose();
                    }
                };
                scope.$watch('message', (v) => {
                    elem.find('[data-message]').html(v);
                });


                if (s.opt && s.opt.duration) {
                    appGui.dom(s.dismiss, s.opt.duration);
                }
                else {
                    if (_.includes(['alert-info', 'alert-success'], s.type)) appGui.dom(scope.dismiss, 2000);
                    if (_.includes(['alert-danger', 'alert-warning'], s.type)) appGui.dom(scope.dismiss, 10000);
                }

                if (s.settings.scroll == true) {
                    appGui.dom(appUtils.scrollToTop);
                }

            }
        };
    }]);

    app.directive('myAlert', function($rootScope, $timeout) {
        return {
            scope: {
                message: "@message",
                type: "@type",
                cls: "@cls",
                scroll: "=scroll",
                opt: "=opt",
                evts: "=evts"
            },
            restrict: 'AE',
            replace: true,
            templateUrl: ALERT_TEMPLATE_URL,
            link: function(scope, elem, attrs) {
                var s = scope;
                var r = $rootScope;
                var fireEvent = (n) => {
                    if (s.evts) {
                        s.evts[n] = s.evts[n] || [];
                        s.evts[n].forEach((cb) => {
                            cb();
                        })
                    }
                };
                $timeout(function() {
                    scope.$apply(function() {
                        elem.addClass(scope.type || 'alert-danger');
                        if (scope.cls) {
                            elem.addClass(scope.cls);
                        }
                    });
                });
                scope.dismiss = () => {
                    //
                    elem.alert('close');
                    fireEvent('close');
                    if (scope.opt && scope.opt.onClose) {
                        scope.opt.onClose();
                    }
                };
                scope.$watch('message', (v) => {
                    elem.find('[data-message]').html(v);
                    if (v && scope.scroll) {
                        appGui.dom(() => {
                            $('html, body').animate({
                                scrollTop: elem.offset().top
                            }, 500);
                        });
                    }
                });

            }
        };
    });

    app.directive('myAlerts', function($rootScope, $timeout, $compile) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                add: '=add',
                directive: '@directive', //custom directive to be created
                stacked: '=stacked',
                settings: '@settings'
            },
            template: '<output></output>',
            link: function(s, elem, attrs) {
                //console.log('my-alerts directive');
                var r = $rootScope;
                //s.stacked = s.stacked === 'true';
                s.decodeMessage = function(msg) {
                    if (typeof msg == 'string') {
                        return msg;
                    }
                    else {
                        return JSON.stringify(msg);
                    }
                };
                s._stacked = [];
                s.evts = {
                    'close': [onClose]
                };
                var fireEvent = (n) => {
                    if (s.evts) {
                        s.evts[n] = s.evts[n] || [];
                        s.evts[n].forEach((cb) => {
                            cb();
                        })
                    }
                };

                function onClose() {
                    if (s.stacked) {
                        s.el = null;
                        if (s._stacked.length === 0) return;
                        var p = s._stacked[0];
                        s._stacked = s._stacked.slice(1);
                        s.add(p.message, p.type, p.timeout, p.scroll, p.opt);
                    }
                }

                s.add = function(message, type, timeout, scroll, opt) {
                    var msg = s.decodeMessage(message);

                    if (type && typeof type !== 'string') {
                        opt = type;
                        type = opt.type || undefined;
                    }

                    if (timeout && typeof timeout === 'object') {
                        opt = timeout;
                        timeout = undefined;
                    }
                    if (opt && opt.scroll === true) {
                        scroll = true;
                    }

                    /*if (s.stacked) {
                        if (s.el) {
                            return s._stacked.push({
                                message: message,
                                type: type,
                                timeout: timeout,
                                scroll: scroll,
                                opt: opt
                            });
                        }
                    } else {*/
                    if (s.el) {
                        s.el.alert('close');
                    }
                    //}

                    var directive = s.directive || 'my-alert';
                    s.opt = opt;
                    var el = $compile("<" + directive + " settings='settings' evts='evts' opt='opt' scroll='" + scroll + "' message='" + msg + "' type='alert-" + (type || 'danger') + "'/>")(s);
                    s.el = el;
                    elem.html('').append(el);
                    if (timeout && directive === 'my-alert') {
                        appGui.dom(function() {
                            elem.html('');
                            fireEvent('close');
                        }, timeout);
                    }
                };

                if (s.directive == 'notify') {
                    r.notify = s.add;
                    r.message = s.add;
                    //console.log('notify-directive-added-to-rootscope');
                }

                window.ss = s;
                //console.log('directive:my-alerts:linked');
            }
        };
    });

})();
