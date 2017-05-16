/*global angular*/
/*global $U*/
/*global moment*/
(function() {
    var app = angular.module('gab_dashboard', []);
    app.controller('gab_dashboard', [
        'server', '$scope', '$rootScope', 'gapi', 'dropdown',
        function(db, s, r, gapi, dropdown) {
            r.toggleNavbar(true);
            r.secureSection(s);
            r.setCurrentCtrl(s);

            var Order = (action, data) => db.ctrl('Order', action, data);

            dropdown.inject(s, {
                setVal: (name, val) => {
                    console.log('drowdown','settings',name,val);
                    s._order.info[name] = val;
                },
                getVal: (name) => s._order.info[name],
                defaultLabel: "Select"
            });

            s._order = {
                info: {},
                type: 'ATOB',
                _owner: r.session()._id,
                when: moment().add(1, 'hours').add(5, 'minutes')
            };

            s.validations = {
                when: true
            };

            s.datepicker = {
                minDate: moment().subtract(1, 'days').toDate().toString()
            };

            s.$watch('_order.when', () => {
                if (moment(s._order.when).isBefore(moment().add(1, 'hours'), 'minutes')) {
                    s.validations.when = false;
                }
                else {
                    s.validations.when = true;
                }
            })

            s.orderTypeLabel = () => s._order.type && s.orderTypes[s._order.type] || s.orderTypeLabelValue || 'Select';
            s.orderTypes = {
                ATOB: "Pick Up / Drop It"
            };
            s.selectOrderType = (type, label) => {
                s.orderTypeLabelValue = label;
                s._order.type = type;
            }








            s.validate = (ok) => {
                if (!s._order.from) return r.infoMessage('Complete departure address please');
                if (!s._order.to) return r.infoMessage('Complete arrival address please');
                if (!s._order.size) return r.infoMessage('Complete size please');
                for (var x in s.validations) {
                    if (s.validations[x] == false) return r.infoMessage('Resolve warning messages please');
                }
                ok && ok();
            };

            s.distance = () => {
                s.validate(() => {
                    gapi.bike_distance(s._order.from, s._order.to, res => {
                        console.info(res);
                    });
                });
            };

            s.add = () => {
                s.validate(() => {
                    Order('create', s._order).then(res => {
                        r.route('tracking');
                        r.infoMessage('Order created');
                    });
                });
            }

            s.removeAll = () => {
                Order('removeWhen', {});
            }

        }
    ]);
})();