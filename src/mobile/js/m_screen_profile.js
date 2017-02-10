{
    gacm.clearEvent('screen_profile_init');
    gacm.on('screen_profile_init', init);

    function init(params) {
        console.log('log screen_profile_init init');

        var ractive = new Ractive({
            el: 'wrapper',
            template: params.template,
            data: {
                greeting: 'Hello',
                recipient: 'Profile 2'
            },
            dashboard: function() {
                gacm.emit('route', 'mrat_dashboard.html');
            }
        });

    }
    gacm.emit('screen_profile');
}