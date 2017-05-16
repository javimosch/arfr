/*global angular*/
/*global $U*/
(function() {
    var app = angular.module('gab_login', []);
    app.controller('gab_login', [
        'server', '$scope', '$rootScope',
        function(db, s, r) {
            var User = (action, data) => db.ctrl('User', action, data);
            r.__hideNavMenu = true;
            r.navShow = true;
            s.show = false;
            $U.expose('s', s);
            $U.once('route-exit:login', function(url) {
                r.__hideNavMenu = false;
            });
            s.login = function() {
                $U.ifThenMessage([
                    [!r._login.email, '==', true, "Fill email please."],
                    [!r._login.pwd, '==', true, "Fill password please."],
                ], (m) => {
                    if (typeof m[0] !== 'string') {
                        r.warningMessage(m[0]());
                    }
                    else {
                        r.warningMessage(m[0]);
                    }
                }, () => {
                    //
                    var session = r.session();
                    if (session.email && session.expire < new Date().getTime()) {
                        //creae session new ?
                    }

                    User('login', r._login).then(function(res) {
                        if (res.ok && res.result != null) {
                            r.session(res.result, true);
                            //                console.log('adminLogin: server says user is logged', res.data);
                            r.route('/');
                        }
                        else {
                            s.loginFailedTimes++;
                            r.warningMessage('Incorrect login');
                        }
                        //            console.log(res.data);
                    }).error(function(res) {
                        s.sendingRequest = false;
                        r.errorMessage('Server down, try later.');
                    });
                    //
                });


            };


            s.create = () => {
                $U.ifThenMessage([
                    [!r._login.email, '==', true, "Fill email please."],
                    [!r._login.pwd, '==', true, "Fill password please."],
                ], (m) => {
                    if (typeof m[0] !== 'string') {
                        r.warningMessage(m[0]());
                    }
                    else {
                        r.warningMessage(m[0]);
                    }
                }, () => {
                    User('save', {
                        email: r._login.email,
                        pwd: r._login.pwd
                    }).then(res => {
                        if (res.ok) {
                            s.login();
                        }
                        else {
                            if (res.err && res.err.code == 11000 && res.err.op && res.err.op.email == r._login.email) {
                                return r.infoMessage('Email already registered. Try to sign in.');
                            }
                            console.warn(res);
                        }
                    });
                });
            }

            s.resetPassword = () => {
                    if (!r._login.email) {
                        return r.warningMessage("Email required");
                    }
                    User('passwordReset', {
                        email: r._login.email
                    }).then((res) => {
                        if (res.ok) {
                            r.message('Un nouveau mot de passe a été envoyé par e-mail', 'info', undefined, undefined, {
                                duration: 10000
                            })
                            s.loginFailedTimes = 0;
                            r.dom();
                        }
                    });
                }
                //fill _login with query string parameters
            var params = {
                email: $U.getParameterByName('email'),
                pwd: ($U.getParameterByName('k')) ? window.atob($U.getParameterByName('k')) : ''
            };
            if (params.email) r._login.email = params.email;
            if (params.pwd) r._login.pwd = params.pwd;
            if (params.email && params.pwd) {
                console.log('adminLogin: lets try to sign-in from queryparameters');
                s.login();
            }
            if (r.logged()) {
                User('get', {
                    _id: r.session()._id
                }).then((err, data) => {
                    if (!err && data.ok && data.result) {
                        r.session(data.result);
                    }
                })
                r.route('/');
            }
            else {
                s.show = true;
            }
        }
    ]);
})();