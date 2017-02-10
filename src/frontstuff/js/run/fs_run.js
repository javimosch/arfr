/*global $U*/
/*global angular*/
/*global $*/
/*global moment*/
/*global _*/
/*global localStorage*/
(function() {
    var app = angular.module('fs_run', []);

    app.config(function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        //delete $httpProvider.defaults.headers.Authorization;
        //  console.info('headers', $httpProvider.defaults.headers);
    });



    app.run(['server', '$timeout', '$rootScope', function(db, $timeout, r) {
        //    console.info('app.admin:run');

        r.defaults = {};

        r.URL = {
            LOGIN: 'login',
            DIAG_SIGN_UP: 'diag-inscription',
            HOME: 'home',
            CONTACT_US: 'contactez-nous',
            ERNT: 'ernt',
            FAQ: 'faq',
            GENERAL_CONDITIONS: 'conditions-generales-utilisation',
            LEGAL_MENTIONS: 'mentions-legales'
        };


        r.navShow = true;

        r.toggleNavbar = function(val) {
            r.navShow = val;
            r.dom();
        };
        r.secureSection = function(_s) {
            _s.show = false;
            if (!r.logged()) {
                console.warn('secureSection:redirecting to login');
                r.route('login');
            }
            else {
                _s.show = true;
                //async update of the current user.
                if(!r.session()._id) return;
                db.ctrl(r.defaults.userCollectionName || 'User', 'getById', r.session()).then(function(d) {
                    if (d.ok && d.result) r.session(d.result,true);
                });
            }
        };

        r.handleSecurityRouteViolation = () => {
            r.route('/');
            console.warn('SECURITY: YOU-DONT-BELONG-HERE');
        };


        //go back (escape key)
        $('html').keydown(function(event) {
            if ('27' == event.keyCode) {
                if (r.params && r.params.prevRoute && r.__currentCtrlScope) {
                    if (r.__currentCtrlScope.back) {
                        if (r.state.working()) {
                            r.message('Loading...', {
                                type: 'warning',
                                duration: 2000
                            });
                            return;
                        }
                        var fn = r.__currentCtrlScope.back;
                        r.__currentCtrlScope = null;
                        fn();
                    }
                    //return r.route(r.params.prevRoute);
                }
            };
        });

        r.setCurrentCtrl = (_s) => {
            $U.expose('s', _s);
            r.__currentCtrlScope = _s
        };

        function getMessage(msg) {
            if (typeof msg === 'function') return msg();
            if (typeof msg !== 'string' && msg.length) return getMessage(msg[0]);
            return msg;
        }

        r.errorMessage = (msg, duration) => {
            msg = getMessage(msg);
            r.notify(msg, {
                type: 'danger',
                duration: duration || 3000
            });
        };
        r.warningMessage = (msg, duration) => {
            msg = getMessage(msg);
            r.notify(msg, {
                type: 'warning',
                duration: duration || 3000
            });
        };
        r.infoMessage = (msg, duration) => {
            msg = getMessage(msg);
            r.notify(msg, {
                type: 'info',
                duration: duration || 3000
            });
        };
        r.successMessage = (msg, duration) => {
            msg = getMessage(msg);
            r.notify(msg, {
                type: 'success',
                duration: duration || 3000
            });
        };

    }]);



    app.run(['server', '$timeout', '$rootScope', function(db, $timeout, r) {
        //console.info('app.common.root:run');
        $U.expose('r', r);
        r.getHashParams = $U.getHashParams;

        r.debug = true;

        r.config = {};
        //db.localData().then((data) => Object.assign(r.config, data.config || {}));


        r.__cache = {};
        r.cache = function(n, o) {
            if (o) {
                return r.__cache[n] = o;
            }
            else {
                if (!_.isUndefined(r.__cache[n]) && !_.isNull(r.__cache[n])) {
                    //console.info('CACHE: retrieving ' + n + ' (' + typeof r.__cache[n] + ')');
                }
                return r.__cache[n] || null;
            }
        };

        r.momentFormat = (d, f) => (moment(d).format(f));
        r.momentTime = (d) => moment(d).format('HH[h]mm');
        r.momentDateTime = (d) => moment(d).format('DD-MM-YY HH[h]mm');

        r.dom = function(cb, timeout) {
            $timeout(function() {
                if (cb) {
                    cb();
                }
                r.$apply();
            }, timeout || 0);
        };
        r.toggleBody = function(val) {
            r.dom(function() {
                var el = document.body;
                el.className = el.className.replace('hidden', '').trim();
                if (!val) {
                    el.className = (el.className + ' hidden').trim();
                }
            });
        };




        r.session = function(data,replace) {
            r._session = $U.store.get('session') || {};
            if (data) {
                Object.assign(r._session, data);
                if(replace){
                    r._session = data;
                }
                $U.store.set('session', r._session);
            }
            return r._session;
        };
        r.logged = function() {
            var ss = r.session();
            return ss._id;
        };


        r.viewAsClient = () => {
            r._session = r._session || {};
            r._session.userType = 'client';
            r.dom();
        };
        r.viewAsDiag = () => {
            r._session = r._session || {};
            r._session.userType = 'diag';
            r.dom();
        };
        r.viewAsAdmin = () => {
            r._session = r._session || {};
            r._session.userType = 'admin';
            r.dom();
        };


        r._login = {
            email: '',
            password: ''
        };
        var session = r.session();
        _.each(session, function(val, key) {
            r._login[key] = val;
        });
        if (session.password) r._login.pwd = session.password; //atob(session.password);
        if (!session.rememberPass) r._login.pwd = null;



        r.logout = function() {
            r.session({
                _id: null,
                email: null,
                pwd: null
            },true);
            r.route('login');
        };

        r.admin = function() {
            r._login.email = 'arancibiajav@gmail.com';
            r._login.pwd = 'gtf';
            r.dom();
        };

        r.hashHas=(word)=>{
            return $U.url.hashName().indexOf(word)!=-1;
        };

        r.route = function(url, delay) {

            setTimeout(function() {
                var path = window.location.origin + window.location.pathname;
                path += '#/' + url;
                $U.emit('route-exit:' + $U.url.hashName());
                r.$emit('route-change', url);

                $U.url.hash(url);
                window.location.href = window.location.href;
                
                if(r.params && r.params.prevRoute == url){
                    delete r.params.prevRoute;
                }
                
            }, delay || 0);
            r.__route = url;
            return url;
        };
        r.routeNotIn = (arr)=>{
            if(arr.length==undefined) arr = [arr];
            for(var x in arr){
                if(r.routeIs(arr[x])) return false;
            }
            return true;
        };
        r.routeIs = (n) => r.__route && r.__route.toString().toLowerCase().indexOf(n && n.toLowerCase() || 'invalid') !== -1 || false;
        r.__route = window.location.href.replace(window.location.origin + window.location.pathname, '');
        r.__routeHashName = $U.url.hashName();
        r.__routeHashNameBefore = $U.url.hashName();
        setTimeout(function() {
            $U.emitPreserve('route-change', r.__route.slice(2));
        }, 500);
        $U.onAnchorChange(() => {
            r.__route = window.location.href.replace(window.location.origin + window.location.pathname, '');
            $U.emit('route-exit:' + r.__routeHashName);
            r.__routeHashName = $U.url.hashName();
            $U.emitPreserve('route-change', r.__route.slice(2))
        });

        r.__userRoles = {};
        r.userRoleCode = (_id) => {
            for(var x in r.__userRoles) 
                if(r.__userRoles[x]._id==_id) return r.__userRoles[x].code;
        };
        r.userHasRole = (roleCode) => {
            if (!r.__userRoles[roleCode]) {
                //console.log('debug unkown role', roleCode);
                return false;
            }
            return _.includes(r.session().roles, r.__userRoles[roleCode]._id);
        };
        db.ctrl('Role', 'getAll').then(res => res.result && res.result.forEach(role => {
            r.__userRoles[role.code] = {
                _id: role._id,
                code: role.code
            };
        }));



        r.userIs = (arr) => {
            var type = r.session().userType;
            if (typeof arr === 'string') arr = [arr];
            return _.includes(arr, type);
        };

        r.routeParams = (obj) => {
            r.params = Object.assign(r.params || {}, obj);
        };


        r.lookUp = function(scope, property) {
            if (scope[property]) return scope[property];
            else {
                if (scope.$parent) {
                    return r.lookUp(scope.$parent, property);
                }
                else {
                    return undefined;
                }
            }
        };


        r.hasMouse = false;
        $U.hasMouse((v) => {
            r.hasMouse = v;
            r.dom();
        });


    }]);

})();