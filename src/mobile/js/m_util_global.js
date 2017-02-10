{
    /*global gacm*/
    /*global $U*/
    /*global $*/
    var g = gacm.g = {};
    var p = {}; //private
    g.id = gacm.config.configurationIdentifier;
    g.logged = function() {
        return $U.val($U.store.get(g.id + '_session'), '_id') != undefined;
    };
    g.logout = function() {
        $U.store.set(g.id + '_session', {});
    };
    g.session = function(data, replace) {
        $U.store.set(g.id + '_session', replace ? data || {} : Object.assign($U.store.get(g.id + '_session') || {}, data || {}));
        return $U.store.get(g.id + '_session');
    };
    g.routeParams = function(_p) {
        p.routeParams = Object.assign(p.routeParams || {}, _p || {});
        return p.routeParams;
    };
    g.route = function(n, p) {
        g.routeParams(p);
        gacm.emit('route', n);
    };
    g.collection = function(n) {
        return function(action, data) {
            var path = gacm.config.serverURL + '/ctrl/' + n + '/' + action;
            path = path.replaceAll('//', '/');
            path = path.replaceAll(':/', '://');
            return $U.req(path, data);
        }
    };

    g.notify = function(str, opt) {
        opt = opt || {};
        $('#notify-body').html(str);
        $('#notify').toggle(true);
        setTimeout(function() {
            $('#notify').toggle(false);
        }, opt.duration || 3000);
    };
    g.warningMessage = function(str) {
        console.log('log [WARNING]', str);
        g.notify(str);
    };
    g.errorMessage = function(str) {
        console.log('log [ERROR]', str);
    };
    g.infoMessage = function(str) {
        console.log('log [INFO]', str);
    };
    g.successMessage = function(str) {
        console.log('log [SUCCESS]', str);
    };




    console.log('log util_global ok');
    gacm.emit('util_global');
}