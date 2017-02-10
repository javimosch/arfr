/*global angular*/
/*global $U*/
(function(){
    var app = angular.module('diags_ctrl_contact_form', []);
    app.controller('diags_ctrl_contact_form', ['server',
    '$timeout', '$scope', '$rootScope', '$uibModal',
    function(db, $timeout, s, r, $uibModal) {
        s._email = {

        };
        s.send = function() {
            
            db.ctrl('Notification', 'ADMIN_NEW_CONTACT_FORM_MESSAGE',s._email).then(function(d) {
                if (d.ok) {
                    r.infoMessage('Message envoyé');
                }
                else {
                    r.infoMessage('Problème de serveur , réessayer plus tard');
                }
            });
            
        };
        s.validate = function() {
            $U.ifThenMessage([
                [!s._email.fullname, '==', true, 'Prénom Nom requis'],
                [!s._email.email, '==', true, 'Email requis'],
                [!s._email.phone, '==', true, 'Phone requis'],
                [!s._email.message, '==', true, 'Message requis'],
            ], (m) => {
                s.warningMsg(m[0], 10000);
            }, s.send);
        }
    }
]);
})();

