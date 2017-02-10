{
    gacm.clearEvent('screen_dashboard_init');
    gacm.on('screen_dashboard_init', init);
    var g = gacm.g;

    function init(params) {
        console.log('log screen_dashboard_init init');

        var r = new Ractive({
            el: 'wrapper',
            template: params.template,
            data: {
                tracking:false,
                recipient: 'world 2',
                session: g.session(),
                trackingVisible: function() {
                    return (r&&r.get('tracking'))?'hidden':'';
                },
            },
            tracking: function() {
                gacm.emit('route', 'mrat_tracking.html');
            },
            profile: function() {
                gacm.emit('route', 'mrat_profile.html');
            },

            init: function() {
                console.log('INIT');
                if (!g.logged()) {
                    this.teardown()
                    g.route(g.ROUTES.LOGIN);
                }
            }
        });
        
        gacm.g.rr=r;


    }
    gacm.emit('screen_dashboard');
}