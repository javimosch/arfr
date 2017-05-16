{
    gacm.clearEvent('screen_tracking_init');
    gacm.on('screen_tracking_init', init);

    function init(params) {
        console.log('log screen_tracking_init init');

        var ractive = new Ractive({
            el: 'wrapper',
            template: params.template,
            data: {
                greeting: 'Hello',
                recipient: 'Tracking 2'
            },
            dashboard:function(){
                gacm.emit('route','mrat_dashboard.html');
            }
        });

    }
    gacm.emit('screen_tracking');
}