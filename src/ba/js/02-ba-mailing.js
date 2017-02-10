/*global $U*/
(function() {
    
    function send(payload, cb) {
        var Notification = window.ba.db('Notification');
        Notification('BA_ADMIN_CONTACT_FORM',payload).then(cb);
    }
    window.ba = window.ba || {};
    var mailing = {};
    mailing.send = send;
    window.ba.mailing = mailing;
})();