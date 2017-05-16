/*global angular*/
/*global $U*/
/*global moment*/
/*global $G*/

(function() {
    var app = angular.module('vf-booking-ctrl', []);



    app.run(['server', '$timeout', '$rootScope', function(db, $timeout, r) {

        r.$toPage = function(relativeUrl, hash, params) {
            $U.url.setRelative($G.urlRoot + '/' + relativeUrl);
        };

    }]);
    app.controller('vf-booking-ctrl', [
        'server', '$scope', '$rootScope',
        function(db, s, r) {
            //
            s.booking = $U.store.get('booking-data') || {
                address: "15 rue L'Hopital Saint Louis",
                date: moment(),
                duration: 2
            };
            s.next = function() {
                $U.url.setRelative($G.urlRoot + '/booking-frilos');
            }
            s.$watch('booking', function() {
                $U.store.set('booking-data', s.booking);
            }, true);
            $U.expose('s', s);
        }
    ]);
    app.controller('vf-booking-frilos-list-ctrl', [
        'server', '$scope', '$rootScope',
        function(db, s, r) {
            //
            s.booking = $U.store.get('booking-data');

            s.$watch('booking', function() {
                $U.store.set('booking-data', s.booking);
            }, true);

            s.items = [{
                name: 'Maellita',
                price: '15/h'
            }, {
                name: 'Jav',
                price: '25/h'
            }];

            s.select = function(item) {
                s.booking.candidatos = s.booking.candidatos || [];
                s.booking.candidatos.push(item);

            };
            s.unselect = function(index) {
                r.dom(function() {
                    s.booking.candidatos.splice(index, 1);
                    r.dom();
                });
            };
            s.next = function() {
                $U.url.setRelative($G.urlRoot + '/booking-confirm');
            }
            $U.expose('s', s);
        }
    ]);
    app.controller('vf-booking-confirm-ctrl', [
        'server', '$scope', '$rootScope',
        function(db, s, r) {
            if(!r.logged()){
                r.$toPage('booking-auth');
            }
            //
            s.booking = $U.store.get('booking-data');

            s.$watch('booking', function() {
                $U.store.set('booking-data', s.booking);
            }, true);

            s.pay = function() {
            }
            $U.expose('s', s);
        }
    ]);
})();