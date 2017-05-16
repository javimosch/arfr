/*global angular*/
/*global $U*/

(function() {
    var app = angular.module('vf-auth-ctrl', []);
    app.controller('vf-auth-ctrl', [
        'server', '$scope', '$rootScope',
        function(db, s, r) {
            //
            s.booking = $U.store.get('booking-data');
            
            s.validate=function(){
                db.ctrl('User','exists',{
                    email:s.email
                }).then(function(d){
                    if(d.ok&&d.result==true){
                        return r.warningMessage('This email already belongs to a registered user.');
                    }
                    if(d.ok&&!d.result){
                        db.ctrl('User','create',{
                            email:s.email,
                            password:s.password
                        }).then(function(d){
                            if(d.ok){
                                r.infoMessage('Account created. Email Notification Sended');
                                if(s.booking){
                                    r.$toPage('booking-confirm');
                                }else{
                                    r.$toPage('dashboard');
                                }
                            }else{
                                r.infoMessage('Server Issue, try later.');
                            }
                        });
                    }
                });
            };
            
            s.search={};
            $U.expose('s',s);
        }
    ]);
})();