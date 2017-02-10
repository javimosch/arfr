/*global angular*/
/*global $U*/

(function() {
    var app = angular.module('vf-home-ctrl', []);
    app.controller('vf-home-ctrl', [
        'server', '$scope', '$rootScope',
        function(db, s, r) {
            //
            s.search={};
            $U.expose('s',s);
        }
    ]);
})();