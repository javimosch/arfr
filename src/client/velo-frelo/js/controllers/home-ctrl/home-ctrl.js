/*global angular*/

(function() {
    var app = angular.module('home-ctrl', []);
    app.controller('home-ctrl', [
        'server', '$scope', '$rootScope',
        function(db, s, r) {
            //
            s.search={};
            //
        }
    ]);
})();