/*global angular*/
/*global $U*/
(function() {
    var app = angular.module('gab_assignment_details', []);
    app.controller('gab_assignment_details', [
        'server', '$scope', '$rootScope', '$routeParams',
        function(db, s, r, params) {
            s.params = params;
            var Order = (action, data) => db.ctrl('Order', action, data);
            r.__hideNavMenu = true;
            r.navShow = true;
            r.setCurrentCtrl(s);
            
            if(!r.userHasRole('biker')) return r.handleSecurityRouteViolation();

            s.item = {};

            s.validate = (ok) => {
                if (!s.item.from) return r.infoMessage('Complete departure address please');
                if (!s.item.to) return r.infoMessage('Complete arrival address please');
                if (!s.item.when) return r.infoMessage('Complete when please');
                ok && ok();
            };


            s.save = (silent) => {
                r.session(s.item);
                s.validate(() => {
                    Order('save', s.item).then(res => {
                        if (!silent) r.infoMessage('Profile saved');
                    });
                });
            };


            if (params.id) {
                Order('get', {
                    _id: params.id,
                }).then(res => s.item = res.ok && res.result || s.item);
            }
        }
    ]);
})();