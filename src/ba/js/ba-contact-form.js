/*global $*/
/*global $U*/
$(function() {

    $U.once('contact-form-init', function() {
        window.ba.auth.check();
    });

    $U.on('auth-token', function(token) {
        console.log(token);
    });

    $U.on('auth-login', function(data) {
        //$('#connect').toggle(false);
        $('#email').val(data.email);
        $('#email').parent().removeClass('is-empty')
        contactForm.ready = true;
    });

    function send() {
        
        if(!$('#message').val()) {
            var _m = $('#message').val();
            $('#message').val('Textarea: I do not bite !!');
            setTimeout(function(){
                $('#message').val(_m);
            },1000);
            return;
        }
        var payload = {
            message: $('#message').val(),
            email: $('#email').val(),
            motive: $("[name='optionsRadios']").filter("[checked]").val()
        }
        console.log('send payload', payload);
        window.ba.mailing.send(payload, function(res) {
            console.log('send resolved', res);
        });

        $('#message').val('');
        $('#email-sended-dialog').modal('show');

    }

    window.ba = window.ba || {};
    var contactForm = {
        connect: function(providerName) {
            window.ba.auth.login(providerName);
        },
        send: send,
        closeModal: function(n) {
            $(n).modal('hide');
        }
    };
    window.ba.contactForm = contactForm;
    $U.emit('contact-form-init');
});