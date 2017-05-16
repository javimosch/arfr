/*global angular*/
/*global _*/
/*global $U*/
(function() {
    var app = angular.module('gab_contact', []);
    app.controller('gab_contact', [
        'server', '$scope', '$rootScope',
        function(db, s, r) {
            r.setCurrentCtrl(s);
            var User = (action, data) => db.ctrl('User', action, data);
            var Role = (action, data) => db.ctrl('Role', action, data);
            var Notification = (action, data) => db.ctrl('Notification', action, data);

            s.item = {
                message:'',
                email:'',
                name:''
            };
            s.send = () => {
                if(!s.item.email)   return r.warningMessage('Email required');
                if(!s.item.message) return r.warningMessage('Message required');
                

                Notification('GAB_ADMIN_CONTACT_FORM', {
                    _form: _.cloneDeep(s.item)
                }).then(res=>{
                    console.log(res);
                });
                r.infoMessage('Message queued for sending. Thanks.');
                s.item.message = '';
                s.item.email = '';
                s.item.name = '';

            };

            console.info('gab_contact');
        }
    ]);
})();