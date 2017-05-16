/*global angular*/
(function() {
    var app = angular.module('srv_google', []);
    app.service('gapi', function($rootScope, server) {
        return {
            bike_distance: function(from, to, callback) {
                //console.log('bike_distance', from, to);
                var service = new window.google.maps.DistanceMatrixService();
                service.getDistanceMatrix({
                    origins: [from],
                    destinations: [to],
                    travelMode: window.google.maps.TravelMode.BICYCLING,
                    unitSystem: window.google.maps.UnitSystem.METRIC,
                }, res => {
                    callback(res && res.rows && res.rows[0] && res.rows[0].elements && res.rows[0].elements[0] || null);
                });
            }
        };
    });
})();