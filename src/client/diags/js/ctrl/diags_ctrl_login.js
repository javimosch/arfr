/*global angular*/
/*global $U*/
var app = angular.module('app.login', []);

app.controller('adminLogin', ['server', '$scope', '$rootScope', function(db, s, r) {
    //console.info('app.admin.login:adminLogin');
    r.__hideNavMenu = true;
    r.navShow = true;
    s.show = false;

    $U.once('route-exit:login', function(url) {
        r.__hideNavMenu = false;
    });

    /*
    db.post('custom',{
        model:"User",action:"find",data:{
            email:{$eq:"arancibiajav@gmail.com"}
        }
    }).then(function(r){
        console.info('CUSTOM:',r.data);
    });
*/

    s.loginFailedTimes = 0;



    s.create = function() {
        s.sendingRequest = true;

        db.custom('user', 'find', {
            email: r._login.email
        }).then(function(res) {
            if (res.data.result.length > 0) {
                r.session(res.data.result[0]);
                console.log('login:user:found:' + res.data.result[0].email);
                r.route('dashboard');
            }
            else {
                _create();
            }
        });

        function _create() {
            db.custom('user', 'save', {
                email: r._login.email,
                password: r._login.password,
                userType: 'admin'
            }).then(function(res) {
                s.sendingRequest = false;
                r.session(res.data.result);
                console.log('adminLogin:admin:creation:success', res.data);
                r.route('dashboard');
            }).error(function(err) {
                s.sendingRequest = false;
                console.log('adminLogin:admin:creation:fail', err);
            });
        }
    };

    s.login = function() {

        /*
        if (r._login.email && r._login.email.indexOf('admin') !== -1) {
            return s.create();
        }
        */

        //console.info('ADMIN:LOGIN')
        var session = r.session();
        if (session.email && session.expire < new Date().getTime()) {
            r.db.createSession(true);
        }

        db.ctrl('User', 'login', r._login).then(function(res) {
            if (res.ok && res.result != null) {
                r.session(res.result);
                //                console.log('adminLogin: server says user is logged', res.data);
                r.route('dashboard');
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

    };

    s.resetPassword = () => {
        if (!r._login.email) {
            return r.warningMessage("Email required");
        }
        db.ctrl('User', 'passwordReset', {
            email: r._login.email
        }).then((res) => {
            if (res.ok) {
                r.message('A new password has been send to ' + r._login.email, 'info', undefined, undefined, {
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
        password: ($U.getParameterByName('k')) ? window.atob($U.getParameterByName('k')) : ''
    };
    if (params.email) r._login.email = params.email;
    if (params.password) r._login.password = params.password;
    if (params.email && params.password) {
        console.log('adminLogin: lets try to sign-in from queryparameters');
        s.login();
    }



    var session = r.session();
    if (session.email && session.expire > new Date().getTime()) {
        r.session(r._login);
        console.log('adminLogin: session found at initial check');
        _asyncUpdateSession();
        r.route('dashboard');
    }
    else {
        s.show = true;
    }



    function _asyncUpdateSession() {
        db.ctrl('User', 'get', {
            _id: session()._id
        }).then((err, data) => {
            if (!err && data.ok && data.result) {
                r.session(data.result);
            }
        })
    }
}]);
