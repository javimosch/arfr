{
    gacm.once('util_global', function() {
        console.log('log constants ok');
        gacm.g.ROUTES = {
            LOGIN: 'mrat_login.html',
            DASHBOARD: 'mrat_dashboard.html'
        };
    });
    gacm.emit('constants');
}