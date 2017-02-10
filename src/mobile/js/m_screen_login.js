{
    /*global gacm*/
    /*global Ractive*/
    /*global $U*/
    /*global $*/
    gacm.clearEvent('screen_login_init');
    gacm.on('screen_login_init', init);
    var r, g = gacm.g;

    function init(params) {
        console.log('log screen_profile_init init');
        r = new Ractive({
            el: 'wrapper',
            template: params.template,
            data: {
                login: {
                    email: 'Hello',
                    pwd: 'Login 2'
                }
            },
            login: login
        });

        $('#notify').toggle(false);
    }

    function login() {
        $U.ifThenMessage([
            [!r.get('login.email'), '==', true, "Fill email please."],
            [!r.get('login.pwd'), '==', true, "Fill password please."],
        ], (m) => {
            g.warningMessage(m[0]);
        }, () => {
            var User = g.collection('User');
            User('login', r.get('login')).then(function(res) {
                if (res.ok && res.result != null) {
                    g.session(res.result, true);
                    g.route(g.ROUTES.DASHBOARD);
                }
                else {
                    g.warningMessage('Incorrect login');
                }
                //            console.log(res.data);
            });
            //
        });
    }

    gacm.emit('screen_login');
}