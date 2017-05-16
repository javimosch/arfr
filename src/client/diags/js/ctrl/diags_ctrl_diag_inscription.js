/*global $U*/
/*global app*/
/*global _*/
(function() {

    app.controller('diagInscription', ['server', '$scope', '$rootScope', '$routeParams',
        function(db, s, r, params) {
            r.__hideNavMenu = true;    
            r.toggleNavbar(true);
            $U.once('route-exit:diag-inscription', function(url) {
                r.__hideNavMenu = false;
            });



            s.item = {
                email: '',
                password: '',
                address: '',
                userType: 'diag',
                priority: undefined,
                commission: 0
            };


            function save() {
                db.custom('user', 'find', {
                    email: s.item.email,
                    userType: 'diag',
                    disabled:true
                }).then(function(res) {
                    if (res.data.result.length > 0) {
                        var _item = res.data.result[0];
                        if (s.item._id && s.item._id == _item._id) {
                            _save(); //same diag
                        }
                        else {
                            s.message('Email address in use.');
                        }
                    }
                    else {
                        _save(); //do not exist.
                    }
                });

                function _save() {
                    db.ctrl('User', 'save', s.item).then((res) => {
                        s.requesting = false;
                        var _r = res;
                        if (_r.ok) {
                            r.infoMessage('Your account has been created. Check for email validation.');
                            r.route('login', 0);
                        }
                        else {
                            r.warningMessage('Error, try later', 'warning');
                        }
                    });
                }
            };

            s.validate = () => {
                $U.ifThenMessage([
                    [!s.item.email, '==', true, "email est nécessaire"],
                    [!s.item.password, '==', true, "password est nécessaire"],
                    [!s.item.address, '==', true, "address est nécessaire"],
                    [!s.item.cellPhone, '==', true, "phone est nécessaire"],
                ], (m) => {
                    r.warningMessage(m[0]);
                }, save);
            };
            $U.expose('s', s);
        }
    ]);
})(app);