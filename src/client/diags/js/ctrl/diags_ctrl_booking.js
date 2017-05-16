/*global val*/
/*global angular*/
/*global _*/
/*global moment*/
/*global $*/
/*global getParameterByName*/
/*global ifThenMessage*/
/*global subTotal*/
/*global openStripeModalPayOrder*/
/*global $U*/
/*global sizePrice*/
/*global totalPrice*/
/*global $D*/
var app = angular.module('app', [
    'app.run',
    'app.services',
    'app.directives',
    'ngRoute',
    'diags_ctrl_contact_form',
    'ui.bootstrap',
    'srv.diagPrice',
    'srv.diagSlots'
]);
var URL = {
    HOME: 'home',
    CONTACT_US: 'contactez-nous',
    ERNT: 'ernmt',
    FAQ: 'faq',
    GENERAL_CONDITIONS: 'conditions-generales-utilisation',
    LEGAL_MENTIONS: 'mentions-legales',
    DIAGS: 'choix-diagnostics',
    RDV: 'rendez-vous',
    LOGIN: 'connexion',
    NEW_ACCOUNT: 'new-inscription',
    ACCOUNT_DETAILS: 'account-details',
    ACCOUNT_DETAILS_BOOKING: 'inscription-details',
    PAYMENT: 'payment'
};
app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'views/diags/booking/booking-1-home.html'
        }).
        when('/home', {
            templateUrl: 'views/diags/booking/booking-1-home.html'
        }).
        when('/mentions-legales', {
            templateUrl: 'views/diags/legal-mentions.html'
        }).
        when('/conditions-generales-utilisation', {
            templateUrl: 'views/diags/general-conditions.html'
        }).
        when('/ernmt', {
            templateUrl: 'views/diags/ernmt.html'
        }).
        when('/faq', {
            templateUrl: 'views/diags/faq.html'
        }).
        when('/contactez-nous', {
            templateUrl: 'views/diags/contact-us.html'
        }).
        when('/choix-diagnostics', {
            templateUrl: 'views/diags/booking/booking-2-diags-selection.html'
        }).
        when('/rendez-vous', {
            templateUrl: 'views/diags/booking/booking-3-date-selection.html'
        }).
        when('/connexion', {
            templateUrl: 'views/diags/booking/booking-4-connection.html'
        }).
        when('/new-inscription', {
            templateUrl: 'views/diags/booking/booking-new-inscription.html'
        }).
        when('/account-details', {
            templateUrl: 'views/diags/booking/booking-inscription-details.html'
        }).
        when('/inscription-details', {
            templateUrl: 'views/diags/booking/booking-5-inscription.html'
        }).
        when('/payment', {
            templateUrl: 'views/diags/booking/booking-6-payment.html'
        }).

        otherwise({
            redirectTo: '/'
        });
    }
]);



app.controller('ctrl.booking', ['server',
    '$timeout', '$scope', '$rootScope', '$uibModal', 'diagPrice', 'diagSlots',
    function(db, $timeout, s, r, $uibModal, diagPrice, diagSlots) {
        r.URL = URL;
        r.dom(); //compile directives

        $U.expose('r', r);
        $U.expose('s', s);

        moment.locale('fr')

        function creatediagSlots() {
            s.diagSlots = diagSlots(s, s.item);
        }



        var MESSAGES = {
            ANSWER_SELL_OR_RENT: 'Répondre Vendez / Louer',
            ANSWER_APPARTAMENT_OR_MAISON: 'Répondre Appartament / Maison',
            FRENCH_ADDRESS_REQUIRED: 'Adresse besoin d&#39;appartenir à France',
        };

        r.__textSTATIC = {
            BOOKING_STRIPE_TEXT: "Paiement simplifié et sécurisé (PCI 1, le niveau le plus élevé) avec Stripe",
            BOOKING_HOME_BG_TEXT_1: "Accédez aux calendriers en live des diagnostiqueurs immobiliers certifiés, disponibles, au bon prix*",
            BOOKING_HOME_BG_TEXT_2: "Nous joindre au",
            BOOKING_HOME_BG_TEXT_PHONE: "0899 399 039"
        };





        $U.on('route-change', function(url) {
            //console.info('route-change ', url);

            r.dom($U.scrollToTop);

            if ($U.indexOf(url, [URL.PAYMENT])) {
                if ((s.__manualUrlChange || 0) + 5000 < new Date().getTime()) {
                    resolvePaymentScreenAuth().then(resolvePaymentScreenOrder);
                }
            }
            else {
                $U.url.clear();
            }

            if ($U.indexOf(url, [URL.HOME]) || url == '') {
                s.__header = 1;

                setTimeout(function() {
                    $U.emit('render-ranges');
                }, 1000);

            }
            else {
                s.__header = 2;
            }

            if (url.indexOf(URL.RDV) !== -1) {
                var wait = setInterval(() => {
                    if (!s.diagSlots) return;
                    clearInterval(wait);
                    s.diagSlots.init();
                }, 100)
            }

            if ($U.indexOf(url, [URL.ACCOUNT_DETAILS])) {
                if (!s._user || !s._user.__subscribeMode) {
                    console.warn('current _user is not in _subscribeMode');
                    r.route(URL.HOME);
                }
                else {
                    delete s._user.__subscribeMode;
                }
            }

        });



        /*
        //this component is a high-level wrapper to retrive diags available slots.
        var diagSlots = function() {
            function asyncRequest(_localCursor, cbHell, dataPosition) {
                _localCursor = new Date(_localCursor);
                s.requestSlots(_localCursor).then((d) => {
                    var d = _.orderBy(d, function(item) {
                        return item.start._d;
                    });

                    if (d.length > 4) {
                        //console.warn('slots-more-than-four-warning',d)
                        try {
                            db.ctrl('Log', "create", {
                                message: "booking-warning: date slot request retrieve " + d.length + ' slots.',
                                data: d
                            });
                        }
                        catch (e) {}

                        while (d.length > 4) {
                            d.pop();
                        };
                        //console.warn('slots-more-than-four-resolve',d)
                    }
                    else {

                    }

                    _data[dataPosition] = new DaySlot(_localCursor, d);
                    //                    console.log('slots-days-request-end-for', _localCursor, 'at', dataPosition);
                    cbHell.next();
                });
            }

            var DaySlot = function(_date, _slots) {
                var o = {
                    date: moment(_date),
                    slots: _slots,
                    label: function() {
                        if (o.isToday()) {
                            return 'Aujourd’hui';
                        }
                        else {
                            return r.momentFormat(o.date, 'dddd DD MMMM');
                        }
                    },
                    isToday: function() {
                        return o.date.isSame(moment(), 'day');
                    }
                };
                return o;
            };
            var _data = [];
            var _nextTimes = 0;
            var cursor = moment();
            var o = {};
            o.get = function() {
                return _data;
            };
            o.init = function() {
                cursor = moment(); //today, tomorrow, tomorrow morrow y tomorrow morrow morrow. 
                o.request();
            };
            o.nextIsDisabled = function() {
                return false; //_nextTimes > 1;
            }
            o.next = function() {
                if (_nextTimes > 15) {
                    _nextTimes = 0;
                    return o.init();
                }
                _nextTimes++;
                cursor = cursor.add(4, 'days');
                o.request();
            };
            o.request = function() {
                var _localCursor = moment(cursor);
                var cbHell = $U.cbHell(4, function() {
                    // console.info('slots-days-request-end');
                    setSelectedRangeDateUsingOrder();
                });
                // console.info('slots-days-request-begin for', r.momentFormat(_localCursor, 'DD-MM-YY'));
                asyncRequest(_localCursor._d, cbHell, 0); //
                _localCursor = _localCursor.add(1, 'days');
                asyncRequest(_localCursor._d, cbHell, 1); //
                _localCursor = _localCursor.add(1, 'days');
                asyncRequest(_localCursor._d, cbHell, 2); //
                _localCursor = _localCursor.add(1, 'days');
                asyncRequest(_localCursor._d, cbHell, 3); //
            };
            return o;
        }();
        s.diagSlots = diagSlots;
        */

        function resolvePaymentScreenAuth() {
            return $U.MyPromise(function(resolve, err, emit) {
                if (s._user && s._user._id) {
                    if (!$U.url.get('auth')) {
                        $U.url.set('auth', s._user._id);
                        s.__manualUrlChange = new Date().getTime();
                    }
                    resolve();
                    return;
                }
                if ($U.url.get('auth')) {
                    db.ctrl('User', 'get', {
                        _id: $U.url.get('auth')
                    }).then(_user => {
                        _user = _user.ok && _user.result || null;
                        if (_user) {
                            s._user = _user;
                            $U.url.set('auth', s._user._id);
                            s.__manualUrlChange = new Date().getTime();
                            resolve();
                        }
                        else {
                            return r.route(URL.LOGIN);
                        }
                    });
                }
                else {
                    return r.route(URL.LOGIN);
                }
            });
        }

        function resolvePaymentScreenOrder() {
            if ($U.url.get('order')) {
                if (!s._order._id) s.fetchOrder($U.url.get('order'));
            }
            else {
                if (!s._order._id) {
                    s.saveAsync().on('success', function() {
                        s.__manualUrlChange = new Date().getTime();
                        if (!s._order._id) throw Error('ORDER-ID-NULL');
                        $U.url.set('order', s._order._id);
                    })
                }
                else {
                    if (!s._order._id) throw Error('ORDER-ID-NULL');
                    s.__manualUrlChange = new Date().getTime();
                    $U.url.set('order', s._order._id);
                }
            }

        }

        //
        s._user = {
            address: null
        }; //user (when auth success)
        s._order = {}; //order (when saved)
        s.booking = {
            order: {
                saved: false,
                exists: false,
                taken: false
            },
            complete: false,
            payment: {
                complete: false
            }
        };

        s.checks = {
            selectAll: false
        };


        function atLeastOneDiagSelected() {
            for (var x in s.item.diags) {
                if (s.item.diags[x] == true) return true;
            }
            return false;
        }


        //MAIN BUTTONS
        s.proceedToDiagsSelection = function() {

            //s.validateBeforePayment(()=r.route(URL.PAYMENT));

            s.validateQuestions(function() {
                r.route('choix-diagnostics');
            }, () => {
                // r.route('home');
            });
        }
        s.proceedToDateSelection = function() {
            s.validateQuestions(function() {
                //at least one diag selected
                if (atLeastOneDiagSelected()) {
                    return r.route('rendez-vous');
                }
                else {
                    return r.warningMessage('Sélectionnez au moins un choix');
                }
            }, () => {
                r.route('home');
            });
        }
        s.proceedToConnect = function() {
            //this is fire from the date checkbox and they need a time to change the state.
            //lets execute this with a delay.
            setTimeout(function() {
                //
                s.validateDate(function() {
                    if (s._user && s._user._id) {
                        r.route(URL.PAYMENT);
                    }
                    else {
                        r.route(URL.LOGIN);
                    }

                });
                //
            }, 500);

        }

        s.dateSlot = {
            proceedToConnect: s.proceedToConnect
        };

        s.validateBooking = function(cb) {
            ifThenMessage([
                [s.isAgency() && !s._order.landLordEmail, '==', true, "E-mail du propriétaire requis"],
                [s.isAgency() && !s._order.landLordFullName, '==', true, "Nom du propriétaire requis"],
                [!s._order.keysAddress, '==', true, 'Clés Adresse requise'],
                [!s._order.keysTimeFrom, '==', true, 'Clés Temps "De" requis'],
                [!s._order.keysTimeTo, '==', true, 'Clés Temps "To" requis'],

                // [s.keysWhereTime.invalidKeysTime(), '==', true, s.keysWhereTime.invalidKeysTimeMessage],

            ], (m) => {
                if (typeof m[0] !== 'string') {
                    s.warningMsg(m[0]());
                }
                else {
                    s.warningMsg(m[0]);
                }
            }, cb);
        }
        s.validateAuthInput = function(cb) {

            ifThenMessage([
                [!s.auth.email, '==', true, "Email required."],
                [!s.auth.pass, '==', true, "Password required."],
            ], (m) => {
                if (typeof m[0] !== 'string') {
                    s.warningMsg(m[0]())
                }
                else {
                    s.warningMsg(m[0]);
                }
            }, cb);

        }
        s.validateClientDetails = function(cb) {
            db.ctrl('User', 'exists', {
                email: s.auth.email,
                userType: 'client',
            }).then(exists => {
                exists = exists.ok && exists.result == true;
                if (exists) {
                    s.warningMsg('This email address belongs to an existing member.');
                }
                else {
                    //validate fields
                    ifThenMessage([
                        [!s._user.email, '==', true, "Email c&#39;est obligatoire."],
                        [!s._user.password, '==', true, "Password c&#39;est obligatoire."],
                        [!s._user.cellPhone, '==', true, "Mobile c&#39;est obligatoire"],
                    ], (m) => {
                        if (typeof m[0] !== 'string') {
                            s.warningMsg(m[0]())
                        }
                        else {
                            s.warningMsg(m[0]);
                        }
                    }, cb);
                }
            });
        }
        s.validateBeforePayment = function(cb, validateLoginAlso) {
            if (validateLoginAlso && (!s._user || !s._user._id)) return r.route(URL.LOGIN);
            s.validateQuestions(function() {
                s.validateDate(cb, () => r.route(URL.RDV));
            }, () => r.route(URL.HOME));
        }
        s.validateDate = function(cb, err) {
            ifThenMessage([
                [s.item.start, '==', undefined, ""],
                [s.item.end, '==', undefined, ""],
                [s.item._diag, '==', undefined, ""],
            ], (m) => {
                s.warningMsg("Sélectionner une date");
                if (err) err();
            }, cb);
        }



        s.validateQuestions = function(cb, err) {
            ifThenMessage([
                [s.item.sell, '==', undefined, MESSAGES.ANSWER_SELL_OR_RENT],
                [s.item.house, '==', undefined, MESSAGES.ANSWER_APPARTAMENT_OR_MAISON],
                [s.item.squareMeters, '==', undefined, "Répondre Superficie"],
                [s.item.constructionPermissionDate, '==', undefined, "Répondre Permis de construire"],
                [s.item.gasInstallation, '==', undefined, "Répondre Gaz"],
                [s.item.electricityInstallation, '==', undefined, "Répondre Electricité"],
                [s.item.address, '==', undefined, "Répondre Address"],
                [_.includes(['France', 'Francia', 'Frankrig', 'Frankrijk',
                    'Frankreich', 'Frankrike', 'Francja'
                ], s.item.country), '==', false, MESSAGES.FRENCH_ADDRESS_REQUIRED]
            ], (m) => {
                s.warningMsg(m[0]);
                if (err) err();
            }, cb);
        };

        //DIAG DATE SELECTION -> Get the slot that the user had selected to the right place.
        s.$watch('item.range', function(id) {
            if (!id) return;
            var data = JSON.parse(window.atob(id));
            s.item._diag = data._diag;
            s.item.start = data.start;
            s.item.end = data.end;
        });

        function setSelectedRangeIDUsingOrder(slots, rngId) {
            if (!$U.val(s._order, '_diag._id')) return;
            if (rngId) return null;
            slots.forEach(v => {
                var data = JSON.parse(window.atob(v.id));
                if (data._diag == s._order._diag || data._diag == s._order._diag._id) {
                    if (data.start == s._order.start && data.end == s._order.end) {
                        r.dom(function() {
                            s.item.range = v.id;
                            return v.id;
                        });
                    }
                }
            })
        }

        function setSelectedRangeDateUsingOrder() {
            if (!$U.indexOf(r.__route, [URL.RDV])) return;
            var id = setSelectedRangeIDUsingOrder(s.slots1, null);
            id = setSelectedRangeIDUsingOrder(s.slots2, id);
            id = setSelectedRangeIDUsingOrder(s.slots3, id);
            id = setSelectedRangeIDUsingOrder(s.slots4, id);
        }


        //DOM CLASS
        s.dateSlotSelected = function(rng) {
            return (s.item.range && (s.item.range == rng.id));
        }


        //DOM HELPERS

        s.orderDateFormatted = function() {
            if (!s._order) console.warn('invalid-order');
            var _date = s._order && s._order.start;
            var m = moment(_date).format('dddd D MMMM YYYY');
            m += ' à ' + r.momentTime(_date);
            return m.substring(0, 1).toUpperCase() + m.slice(1);
        };
        s.orderDiagFormatted = function() {
            return 'Avec ' +
                (((s._order && s._order._diag && s._order._diag.firstName) && s._order._diag.firstName + ' ') || 'Pepe ') +
                (((s._order && s._order._diag && s._order._diag.lastName) && s._order._diag.lastName.substring(0, 1).toUpperCase() + ' ') || 'G');
        };

        s.$watch('checks.selectAll', function() {
            if (!s.diags) return;
            s.diags.forEach(d => {
                s.item.diags[d.name] = s.checks.selectAll;
            });
        }, true);


        db.ctrl('Settings', 'getAll', {}).then(d => {
            if (d.ok && d.result.length > 0) s.settings = d.result[0];
        });




        s.htmlReplaceDiagName = function(str) {
            var code = str.replace('$NAME', s.diagSelected.label2).toUpperCase();
            return r.html(code);
        }


        function orderPaid() {
            return _.includes($D.ORDER_STATUS_PAID, s._order.status);
        }

        s.orderPaid = orderPaid;

        s.departmentHasTermites = () => {
            if (s.item.department) {
                var code = s.item.postCode.substring(0, 2);
                return _.includes(s.termitesDepartments.map(v => (v.toString())), code);
            }
        };

        s.orderExistsNote = () => {
            if (!s.booking.order.exists) return;
            if (!s.booking.order.saved) return;

            if (s._user.clientType !== 'landlord') {
                if (s._order.landLordPaymentEmailSended == true) {
                    if (!s.booking.order.delegatedTo) {
                        s.booking.order.delegatedTo = s._order.landLordEmail;
                    }
                }
                else {
                    return "The payment of this order is pending.";
                }
            }


            var delegated = 'The payment of this order was delegated to ' + s.booking.order.delegatedTo;
            if (orderPaid()) {
                if (s._order.landLordPaymentEmailSended == true) {
                    return "This order was delegated to " + s.booking.order.delegatedTo + ' and is already paid.';
                }
                else {
                    return "This order is already paid"
                }
            }
            else {
                return delegated;
            }
        };


        //Auto-save Every 5sec, only if _order change.
        function updateAutoSave(enabled) {
            enabled = enabled || true;
            var saving = false;
            if (s.__autoSaveInterval) window.clearInterval(s.__autoSaveInterval);
            if (!enabled) return console.info('auto-save: disabled');
            if (!s._order) return console.info('auto-save: call updateAutoSave _order exists');
            cloneOrder();
            s.__autoSaveInterval = window.setInterval(function() {
                if (saving) return;
                if (!s._order) return; //no order to save;
                var hasChanged = !_.isEqual(s.__clonedOrder, s._order);
                if (hasChanged) {
                    saving = true;
                    cloneOrder();
                    db.ctrl('Order', 'update', s._order).then(function() {
                        saving = false;
                        console.info('auto-save: saved');
                    })
                }
            }, 5000);

            function cloneOrder() {
                s.__clonedOrder = _.cloneDeep(s._order);
            }
        }


        //KEYS WHERE Version2 --------------------------------
        s.__keysWhereItems = {};
        s.__keysWhereGetItems = () => {
            if (!s._user || !s._user.clientType) return {
                'Ou ?': () => '',
            };
            if (s.isLandLord()) {
                return {
                    'Ou ?': () => '',
                    'Sur Place': () => s._order.address,
                    'Votre adresse': () => s._user.address, //when landlord
                    'Other': () => 'other'
                };
            }
            else {
                return {
                    'Ou ?': () => '',
                    'Sur Place': () => s._order.address,
                    'Votre adresse': () => s._user.address, //when not-landlord
                    'Résidence Principal': () => s._order.landLordAddress, //when not-landlord 
                    'Other': () => 'other'
                };
            }
        };
        s.$watch('_user', function(val) {
            s.__keysWhereItems = s.__keysWhereGetItems();
        }, true);
        s.__keysWhereSelectFirstItem = () => s.__keysWhereItems && Object.keys(s.__keysWhereItems)[0] || "Loading";
        s.__keysWhereSelectLabel = () => s.__keysWhereSelectLabelVal || s.__keysWhereSelectFirstItem();
        s.__keysWhereSelect = (key, val) => {
            s._order.keysWhere = val && val() || undefined;
        };
        s.$watch('_order.keysWhere', function(val) {
            if (val == undefined) {
                r.dom(() => {
                    s._order.keysAddress = 'non disponible';
                });
                r.dom(() => {
                    s._order.keysAddress = undefined;
                }, 2000);
                //
                return s.__keysWhereSelectLabelVal = 'Ou ?';
            }
            Object.keys(s.__keysWhereItems).forEach(k => {
                if (s.__keysWhereItems[k]() == val) {
                    s.__keysWhereSelectLabelVal = k;
                }
            });
            s._order.keysAddress = (val == 'other') ? '' : val;


            r.dom(() => {
                //auto set from
                if (s.__keysWhereSelectLabel() == "Sur Place") {
                    s.__keysTimeFromSelect(r.momentTime(s._order.start), new Date(moment(s._order.start).toString()));
                }
                else {
                    var m = moment(s._order.start).hours(8);
                    s.__keysTimeFromSelect(r.momentTime(m), new Date(m.toString()));
                }
                //auto set to
                if (s.__keysWhereSelectLabel() == "Sur Place") {
                    s.__keysTimeToSelect(r.momentTime(s._order.start), new Date(moment(s._order.start).toString()));
                }
                else {
                    var m = moment(s._order.start).subtract(30, 'minutes');
                    s.__keysTimeToSelect(r.momentTime(m), new Date(m.toString()));
                }
            }, 200);

        });

        //KEYS TIME FROM ------------------------------------------------------------------------------------------------
        s.__keysTimeFromItems = {};
        s.__keysTimeFromGetItems = () => {
            var vals = {};
            if (!s._order) return vals;
            var m = moment(s._order.start).hours(8);
            while (m.isBefore(moment(s._order.start))) {
                vals[r.momentTime(m)] = new Date(m.toString());
                m = m.add(5, 'minutes');
            };
            vals[r.momentTime(s._order.start)] = new Date(moment(s._order.start).toString());


            return vals;
        };
        s.__keysTimeFromSelectFirstItem = () => s.__keysTimeFromItems && Object.keys(s.__keysTimeFromItems)[0] || "Loading";
        s.__keysTimeFromSelectLabel = 'choisir';
        s.__keysTimeFromSelect = (key, val) => {
            s._order.keysTimeFrom = val;
            if (dtAfter(s._order.keysTimeFrom, s._order.keysTimeTo)) {
                s._order.keysTimeTo = undefined;
            }
            s.__keysTimeFromSelectKey = key;
        };
        s.$watch('_order.keysTimeFrom', function(val) {
            if (!val) {
                s.__keysTimeFromSelectLabel = 'choisir';
            }
            else {
                s.__keysTimeFromSelectLabel = 'choisir';
                _.each(s.__keysTimeFromItems, (v, k) => {
                    if (v == val) s.__keysTimeFromSelectLabel = k;
                });
                if (s.__keysTimeFromSelectLabel == 'choisir' && s.__keysTimeFromSelectKey) {
                    s.__keysTimeFromSelectLabel = s.__keysTimeFromSelectKey;
                }
            }

        });
        s.$watch('_order.start', function(val) {
            s.__keysTimeFromItems = s.__keysTimeFromGetItems();
        });


        function dtAfter(d1, d2, unit) {
            return moment(d1).isAfter(moment(d2), unit);
        }

        function dtBefore(d1, d2, unit) {
            return moment(d1).isAfter(moment(d2), unit);
        }


        //KEYS TIME TO ------------------------------------------------------------------------------------------------
        s.__keysTimeToItems = {};
        s.__keysTimeToGetItems = () => {
            var vals = {};
            if (!s._order) return vals;
            var m = moment(s._order.start).hours(8).minutes(0);
            if (
                moment(s._order.keysTimeFrom).isAfter(m) &&
                moment(s._order.keysTimeFrom).isBefore(moment(s._order.start))
            ) {
                m = m.hours(moment(s._order.keysTimeFrom).hours())
                m = m.minutes(moment(s._order.keysTimeFrom).minutes())
            }

            while (m.isBefore(moment(s._order.start))) {
                vals[r.momentTime(m)] = new Date(m.toString());
                m = m.add(5, 'minutes');
            };
            vals[r.momentTime(s._order.start)] = new Date(moment(s._order.start).toString());



            return vals;
        };
        s.__keysTimeToSelectFirstItem = () => s.__keysTimeToItems && Object.keys(s.__keysTimeToItems)[0] || "Loading";
        s.__keysTimeToSelectLabel = 'choisir';
        s.__keysTimeToSelect = (key, val) => {
            s._order.keysTimeTo = val;
            s.__keysTimeToSelectKey = key;
        };
        s.$watch('_order.keysTimeTo', function(val) {
            if (!val) {
                s.__keysTimeToSelectLabel = 'choisir';
            }
            else {
                s.__keysTimeToSelectLabel = 'choisir';
                _.each(s.__keysTimeToItems, (v, k) => {
                    if (v == val) s.__keysTimeToSelectLabel = k;
                });
                if (s.__keysTimeToSelectLabel == 'choisir' && s.__keysTimeToSelectKey) {
                    s.__keysTimeToSelectLabel = s.__keysTimeToSelectKey;
                }
            }

        });
        s.$watch('_order.keysTimeFrom', function(val) {
            s.__keysTimeToItems = s.__keysTimeToGetItems();
        });
        s.$watch('_order.start', function(val) {
            s.__keysTimeToItems = s.__keysTimeToGetItems();
        });
        //-------------------------------------------------------------------------






        //
        r.logger.addControlledErrors([
            "ORDER_EXISTS", "ORDER_TAKEN"
        ]);

        s.datepicker = {
            minDate: moment(), //.add(1, 'day'), //today is available with an increase in price.
            maxDate: moment().add(60, 'day'),
            initDate: new Date()
        };


        s.CLIENT_TYPES = ['agency', 'enterprise', 'landlord', 'other'];
        s.CLIENT_TYPES_COMPANY = ['agency', 'enterprise', 'other'];

        s.isLandLord = () => {
            return !_.includes(s.CLIENT_TYPES_COMPANY, s._user.clientType);
        }
        s.isAgency = () => {
            return !s.isLandLord();
        };

        s.item = {
            date: undefined,
            diags: {},
            clientType: 'landlord'
        };





        var waitForProperties = (cbArray, props) => {
            var i = setInterval(function() {
                var rta = true;
                props.forEach((v) => {
                    if (_.isUndefined(s[v])) {
                        rta = false;
                    }
                });
                if (rta) {
                    clearInterval(i);
                    cbArray.forEach((cb) => {
                        cb();
                    });
                }
            }, 200);
        };

        s.__constructionPermissionDateSelectLabel = 'choisir';
        s.__constructionPermissionDateSelect = (key, val) => {
            s.item.constructionPermissionDate = val;

        };
        s.$watch('item.constructionPermissionDate', function(val) {
            s.__constructionPermissionDateSelectLabel = val ? val : 'choisir';
            r.dom();
        });

        s.__gazSelectLabel = 'choisir';
        s.__gazSelect = (key, val) => {
            s.item.gasInstallation = val;
        };
        s.$watch('item.gasInstallation', function(val) {
            s.__gazSelectLabel = val ? val : 'choisir';
            r.dom();
        });


        s.diagRightClass = function() {
            var cls = {
                'diag-dialog-right': true,
                'margin-top-three': true,
                'padding-three': true
            };
            cls['bg-' + s.diagSelected.name] = true;
            return cls;
        };

        s.diagSelected = {};
        s.selectDiag = (d) => s.diagSelected = (typeof d == 'string') ? s.diag[d] : d;
        s.homeOneTitle = () => decodeURI(val(s.diagSelected, 'dialogs.one.title'));
        s.homeOneContent = () => decodeURI(val(s.diagSelected, 'dialogs.one.content'));
        s.homeTwoTitle = () => decodeURI(val(s.diagSelected, 'dialogs.two.title'));
        s.homeTwoContent = () => decodeURI(val(s.diagSelected, 'dialogs.one.content'));
        s.homeThreeTitle = () => decodeURI(val(s.diagSelected, 'dialogs.two.title'));
        s.homeThreeContent = () => decodeURI(val(s.diagSelected, 'dialogs.three.content'));

        db.localData().then(function(data) {
            Object.assign(s, data);

            s.diags = _.sortBy(s.diags, function(o) {
                return o.sort;
            });

            //accessors for diags
            s.diag = s.diag || {};
            s.diags.forEach(diag => {
                s.diag[diag.name] = diag;
            });
            s.diagSelected = s.diag.dpe;



            updateChecksVisibilityOnDemand();
            waitForProperties([loadDefaults, r.dom], ['notify']);
        });


        /*
                function scrollToAnchor() {
                    try {
                        if ($.hrefAnchor()) {
                            $.fn.fullpage.moveTo($.hrefAnchor());
                        }
                    }
                    catch (e) {

                    }
                }
                */



        var diagDescription = (n) => {
            var rta = n;
            s.diags.forEach((diag) => {
                if ((n && diag.name == n)) {
                    rta = diag.label;
                }
            });
            if (n === 'cpd') rta = 'constructionPermissionDate';
            return rta;
        }
        var diag = (n) => {
            var rta = null;
            s.diags.forEach((diag) => {
                if ((n && diag.name == n)) {
                    rta = diag;
                }
            });
            return rta;
        }
        s.diagLabel = (n, v) => {
            if (!v) return;
            return diag(n).label;
        };

        /*
        s.diagPrice = (n, v) => {
            if (!v) return;
            return diag(n).price;
        };*/

        var param = (n, validate) => {
            var val = getParameterByName(n);
            if (!val) return undefined;
            if (!validate) {
                return val;
            }
            else {
                var vals = Object.keys(validate).map((v) => {
                    return validate[v]
                }); //valid vals
                if (vals.length > 0 && !_.includes(vals, val)) {
                    var msg = 'Parameter ' + diagDescription(n) + ' has the follow valid values:' + JSON.stringify(vals);
                    console.warn(msg);
                    s.notify(msg, 'warning', 0, true, {
                        duration: 99999
                    })
                    return undefined;
                }
                else {
                    return val;
                }
            }
        };
        var paramDate = s.paramDate = (n) => {
            var v = (getParameterByName(n) || '').toString()
            var d = new Date(v);
            if (isFinite(d)) {
                var fail = false;
                if (moment(d).isBefore(s.datepicker.minDate, 'day')) {
                    fail = true;
                }
                if (moment(d).isAfter(s.datepicker.maxDate, 'day')) {
                    fail = true;
                }
                if (fail) {
                    s.notify('Parameter ' + n + ' needs to be a valid date between ' + s.datepicker.minDate.format("DD/MM/YY") + ' and ' + s.datepicker.maxDate.format('DD/MM/YY'), 'warning', 0, true, {
                        duration: 99999
                    })
                    return undefined;
                }
                return d;
            }
            else {
                if (getParameterByName(n) !== null) {
                    s.notify('Parameter ' + n + ' needs to be a valid date', 'warning', 0, true, {
                        duration: 99999
                    })
                }
            }
            return undefined;
        }
        var paramBool = (n) => {
            var v = (getParameterByName(n) || '').toString()
            if (_.includes(['1', '0'], v)) {
                return v === '1';
            }
            else {
                if (getParameterByName(n) !== null) {
                    s.notify('Parameter ' + n + ' needs to be a 1/0', 'warning', 0, true, {
                        duration: 99999
                    })
                }
                return undefined;
            }
        }

        function toggleMandatory(n, val) {
            s.diags.forEach((diag) => {
                if ((n && diag.name == n) || !n) {
                    diag.mandatory = val;
                    //console.log('toggle-mandatory ',n,val);
                    r.dom();
                }
            });
        }
        s.toggleMandatory = toggleMandatory;

        s.lineThrough = (item) => (item.show == false);

        function updateChecksVisibilityOnDemand() {
            var toggle = (n, val) => {
                s.diags.forEach((diag) => {
                    if ((n && diag.name == n) || !n) {
                        diag.show = val;
                        if (diag.show == false) {
                            s.item.diags[diag.name] = false;
                        }
                    }
                });
            };
            s.diags.forEach(function(val, key) {
                s.item.diags[val.name] = (val.mandatory) ? true : false;
            });

            s.$watch('item.constructionPermissionDate', updateChecks);
            s.$watch('item.sell', updateChecks);
            s.$watch('item.gasInstallation', updateChecks);
            s.$watch('item.address', updateChecks);
            s.$watch('item.electricityInstallation', updateChecks);

            function updateChecks() {

                /*alredt done in questions validations
                                setTimeout(function() {
                                    if (s.item.country !== 'France') {
                                        s.warningMsg(MESSAGES.FRENCH_ADDRESS_REQUIRED);
                                    }
                                }, 2000);*/


                if (s.item.constructionPermissionDate === 'Avant le 01/01/1949') {
                    toggle('crep', true);
                    s.item.diags.crep = true; //mandatory
                    toggleMandatory('crep', true);
                }
                else {
                    s.item.diags.crep = false; //
                    toggle('crep', true);
                    toggleMandatory('crep', false);
                }

                if (s.departmentHasTermites()) {
                    toggle('termites', true);
                    s.item.diags.termites = true;
                    toggleMandatory('termites', true);
                }
                else {
                    toggle('termites', false);
                    s.item.diags.termites = false;
                    toggleMandatory('termites', false);
                }

                if (_.includes(['Avant le 01/01/1949', 'Entre 1949 et le 01/07/1997'], s.item.constructionPermissionDate)) {
                    toggle('dta', true);
                    s.item.diags.dta = true; //mandatory
                    toggleMandatory('dta', true);
                }
                else {
                    toggle('dta', true);
                    s.item.diags.dta = false;
                    toggleMandatory('dta', false);
                }

                if (_.includes(['Oui, Plus de 15 ans', 'Oui, Moins de 15 ans'], s.item.gasInstallation)) {
                    toggle('gaz', true);
                    if (s.item.sell == true && s.item.gasInstallation === 'Oui, Plus de 15 ans') {
                        s.item.diags.gaz = true;
                        toggleMandatory('gaz', true);
                    }
                    else {
                        s.item.diags.gaz = false;
                        toggleMandatory('gaz', false);
                    }
                }
                else {
                    toggle('gaz', false);
                    toggleMandatory('gaz', false);
                }
                if (_.includes(['Plus de 15 ans', 'Moins de 15 ans'], s.item.electricityInstallation)) {
                    toggle('electricity', true);
                    if (s.item.sell == true && s.item.electricityInstallation === 'Plus de 15 ans') {
                        s.item.diags.electricity = true;
                        toggleMandatory('electricity', true);
                    }
                    else {
                        s.item.diags.electricity = false;
                        toggleMandatory('electricity', false);
                    }
                }
                else {
                    toggle('electricity', false);
                    toggleMandatory('electricity', false);
                }

            }
            toggle(undefined, true); //all checks visibles.
        }

        function loadDefaults() {
            //console.log('loadDefaults');
            s.item = Object.assign(s.item, {
                sell: paramBool('sell') || true,
                house: paramBool('house') || undefined,
                squareMeters: param('squareMeters', s.squareMeters) || '90 - 110m²', // '- de 20m²',
                // apartamentType: param('apartamentType', s.apartamentType) || undefined,
                constructionPermissionDate: param('cpd', s.constructionPermissionDate) || undefined, // 'Entre 1949 et le 01/07/1997',
                address: param('address') || undefined, // "15 rue L'Hopital Sain Louis",
                gasInstallation: param('gasInstallation', s.gasInstallation) || undefined, // 'Oui, Moins de 15 ans',
                electricityInstallation: param('electricityInstallation', s.electricityInstallation) || undefined, // 'Plus de 15 ans',
                date: paramDate('date'),
                time: param('time', ['any']),
                clientType: param('clientType', s.CLIENT_TYPES)
            });

            creatediagSlots();

            r.dom(function() {
                try {
                    var x = 0;
                    for (var pos in s.squareMeters) {
                        if (s.item.squareMeters == s.squareMeters[pos]) {
                            break;
                        }
                        else {
                            x++;
                        }
                    }
                    $("input[type=range]").val(x);
                    // console.log('range-set-at-', x);
                }
                catch (e) {}
            });

            $U.emitPreserve('booking-defaults-change');

            s.diags.forEach((diag) => {
                var val = paramBool(diag.name);
                if (!_.isUndefined(val) && !_.isNull(val)) {
                    s.item.diags[diag.name] = val;
                }
            });
        }

        /*
        s.requestSlots = function(date) {
            return $U.MyPromise(function(resolve, error, evt) {
                if (!isFinite(new Date(date))) return; //invalid

               


                var time = s.totalTime();
                var order = {
                    day: date,
                    time: time
                };
                db.getAvailableRanges(order).then(function(data) {
                    //console.log('slots', data);
                    data = data.length > 0 && data || null;
                    if (s.item.time == 'any') {
                        if (data && s.availableTimeRanges.length > 0) {
                            s.pickTimeRange(data[0]);
                        }
                    }
                    if (!data) return;
                    var cbHell = $U.cbHell(data.length, function() {
                        //   console.log('slots-ok', data);
                        resolve(data);
                    });

                    data.forEach(r => {

                        r.id = window.btoa(JSON.stringify(r));

                        if (moment(date).day() === 0) {
                            //on sundays, this rngs had a different basic price (+100%)
                            var basePriceIncr = 100;
                           
                            r.price = s.totalPriceRange(date);
                            r.price += r.price * basePriceIncr / 100;
                        }
                        else {
                            r.price = s.totalPriceRange(date);
                        }



                        db.ctrl('User', 'get', {
                            _id: r._diag
                        }).then(d => {
                            if (d.ok && d.result) {
                                r.name = d.result.firstName + ', ' + d.result.lastName.substring(0, 1);
                                if (d.result.diagPriority) {
                                    r.name += ' (' + d.result.diagPriority + ')';
                                }
                                cbHell.next();
                            }
                        });
                    });
                });
            });
        };

*/

        //----------------------------------------------------------
        //s.$watch('item.date', function(date) {
        //s.requestSlots(date);
        //});






        s.selectedDate = function() {
            return moment(s.item.date).format('DD MMMM YYYY');
        };
        s.drawRange = function(rng) {
            var rta = moment(rng.start).format("HH[h]mm");
            //rta += ' - ' + s.totalPrice(true) + ' €';
            rta += ' - ' + rng.price + ' €';
            // + ' - ' + moment(rng.end).format("HH[h]mm");
            return rta;
        };



        //----------------------------------------------------------
        s.infoMsg = (msg) => {
            s.notify(msg, {
                type: 'info',
                duration: 5000
            });
        };
        s.warningMsg = (msg) => {
            s.notify(msg, {
                type: 'warning',
                duration: 5000
            });
        };
        s.successMsg = (msg) => {
            s.notify(msg, {
                type: 'success',
                duration: 2000
            });
        };




        s.auth = {
            email: undefined,
            pass: undefined
        };


        s.orderSaved = () => {
            return s._order && s._order._id;
        };
        s.paymentDelegated = () => {
            return s._order.landLordPaymentEmailSended == true;
        };

        s.login = () => {
            s.validateAuthInput(() => {
                db.ctrl('User', 'get', {
                    email: s.auth.email,
                    password: s.auth.pass,
                    userType: 'client'
                }).then(_user => {
                    _user = _user.ok && _user.result || null;
                    if (_user) {
                        s.item.clientType = _user.clientType;
                        s._user = _user;

                        s.validateBeforePayment(function() {
                            s.saveAsync().on('success', function() {
                                s.route(URL.PAYMENT);
                            });
                        }, true);

                        //s.subscribeMode = true;
                        //s.right();

                    }
                    else {
                        s.warningMsg('Invalid credentials');
                    }
                });
            });
        }





        s.invoiceEndOfTheMonth = () => {
            s.validateBooking(() => {
                db.ctrl('Order', 'confirm', s._order).then((d) => {
                    if (d.ok) {
                        s.booking.complete = true;
                        db.ctrl('Order', 'update', s._order); //async
                    }
                });
            });
        };


        s.bookingDescriptionTitle = function() {
            if (s.item.sell) return "Pack Vente: ";
            else return "Pack Location: ";
        };
        s.bookingDescriptionBody = function() {
            var rta = "";
            if (s.item.house) {
                rta += "Maison";
            }
            else {
                rta += "Appartement";
            }
            if (s.item.city) {
                rta += " à " + s.item.city;
            }
            if (s.item.constructionPermissionDate) {
                rta += " " + s.item.constructionPermissionDate;
            }
            rta += ', ' + s.item.squareMeters;
            if (!_.includes(['Non', 'Oui, Moins de 15 ans'], s.item.gasInstallation)) {
                rta += ', Gaz';
            }
            if (s.item.electricityInstallation != 'Moins de 15 ans') {
                rta += ", Électricité";
            }
            rta += '.';
            return rta;
        };
        s.bookingDescription = function() {
            return s.bookingDescriptionTitle() + s.bookingDescriptionBody();
        };


        s.sendPaymentLink = () => {
            s.validateBooking(_sendPaymentLink);

            function _sendPaymentLink() {
                db.ctrl('Order', 'update', s._order); //async
                s.openConfirm({
                    templateUrl: "views/diags/booking/partials/booking-delegate-popup.html",
                    data: {
                        email: s._order.landLordEmail,
                        title: "Confirmer la délégation",

                    }
                }, () => {



                    $D.getInvoiceHTMLContent(db, s._order, r, html => {
                        ////LANDLORD//#1 OK app.booking
                        db.ctrl('Notification', 'LANDLORD_ORDER_PAYMENT_DELEGATED', {
                            _user: s._user,
                            _order: s._order,
                            attachmentPDFHTML: html
                        }).then(data => {
                            _sendPaymentLinkNext(data);
                        });
                    });

                    function _sendPaymentLinkNext(data) {
                        db.ctrl('Notification', 'LANDLORD_ORDER_PAYMENT_DELEGATED', {
                            _user: s._user, //the agency
                            _order: s._order
                        }).then(data => {
                            if (!data.ok) {
                                return r.warningMessage("Le courriel ne peut être envoyé à ce moment , d'essayer de nouveau de backoffice", 10000);
                            }
                            //s.infoMsg("Email envoyer avec succès. Suivi de votre commande dans le back office.");
                            s.infoMsg("Commande Créée", 10000);
                            s._order.notifications = s._order.notifications || {};
                            s._order.notifications.LANDLORD_ORDER_PAYMENT_DELEGATED = true;
                            s._order.status = 'ordered';
                            db.ctrl('Order', 'update', {
                                _id: s._order._id,
                                notifications: s._order.notifications
                            });
                            s.booking.complete = true;
                            r.route('home');
                        });
                    }



                });
            }
        };



        s.subscribeClientStandAlone = function() {
            s.createClient(function() {
                s.infoMsg('Le compte a été créé . Vérifiez votre email .');
                r.route(URL.HOME);
            })
        }

        s.subscribeClient = function() {
            s.createClient(function() {
                //s.infoMsg('Le compte a été créé . Vérifiez votre email .');
                s.validateBeforePayment(function() {
                    s.saveAsync().on('success', function() {
                        s.route(URL.PAYMENT);
                    });
                }, true);
            });
        }

        s.createClient = function(cb) {
            s.validateClientDetails(function() {
                db.ctrl('User', 'createClient', s._user).then(data => {
                    if (data.ok) {
                        s._user = data.result;
                        cb();
                    }
                    else {
                        s.warningMsg(data.err);
                    }
                })
            });
        }

        s.subscribeModeBooking = (clientType) => s.subscribe(clientType, URL.ACCOUNT_DETAILS_BOOKING);
        s.subscribeMode = (clientType) => s.subscribe(clientType, URL.ACCOUNT_DETAILS);

        s.subscribe = (clientType, nextRoute) => {
            s.validateAuthInput(() => {
                db.ctrl('User', 'exists', {
                    email: s.auth.email,
                    userType: 'client',
                }).then(exists => {
                    exists = exists.ok && exists.result == true;
                    if (exists) {
                        s.warningMsg('This email address belongs to an existing member.');
                    }
                    else {
                        s._user.email = s.auth.email;
                        s._user.password = s.auth.pass;
                        s._user.clientType = clientType;
                        s._user.__subscribeMode = true;
                        r.route(nextRoute);
                    }
                });
            });
        };





        function fetchOrder(_order_id) {
            return $U.MyPromise(function(resolve, err, emit) {
                var payload = Object.assign(s._order, {
                    __populate: {
                        _client: '_id email clientType address',
                        _diag: '_id email clientType address firstName lastName'
                    }
                });
                if (_order_id) {
                    payload._id = _order_id;
                }
                db.ctrl('Order', 'getById', payload)
                    .then(d => {
                        if (d.ok) {
                            console.info('fetch-order', payload._id, r.momentDateTime(d.result.start));
                            r.dom(function() {
                                setOrder(d.result);
                            });
                            resolve(s._order);
                        }
                        else {
                            err(d);
                        }
                    });
            });
        }
        s.fetchOrder = fetchOrder;

        function setOrder(_order) {
            s._order = _order;
            //s._order.price = s.totalPrice(true);
            s._order.price = diagPrice.getPriceQuote(s);
            commitOrderInfo();
            updateAutoSave();
        }

        function commitOrderInfo() {
            if (!s._order) return;


            if (s._order.info.house === undefined && s.item.house !== undefined) {
                s._order.info.house = s.item.house;
            }

            if (s._order.info.sell === undefined && s.item.sell !== undefined) {
                s._order.info.sell = s.item.sell;
            }

            if (s._order.info.electricityInstallation === undefined && s.item.electricityInstallation !== undefined) {
                s._order.info.electricityInstallation = s.item.electricityInstallation;
            }

            if (!s._order.info.description && s.item) {
                s._order.info.description = s.bookingDescriptionTitle() + s.bookingDescriptionBody();
            }


            if (s._order.info.house == undefined) {
                console.warn('The order info.house is undefined.');
            }
        }

        //SAVEASYNC
        s.saveAsync = () => {
            return $U.MyPromise(function(resolve, err, evt) {


                if (s._user) {
                    //s.item._client = s._user._id;
                    s.item._client = s._user; //we need the full user ref for price discount calcs.
                    s.item.email = s._user.email;
                    s.item.clientType = s._user.clientType;
                }

                //defaults for keysTime
                if (!s.item.keysTimeFrom && s.item.start) {
                    s.item.keysTimeFrom = moment(s.item.start).subtract(2, 'hour');
                }
                if (!s.item.keysTimeTo && s.item.start) {
                    s.item.keysTimeTo = moment(s.item.start);
                }

                //update price
                //s.item.price = s.totalPrice(true);
                s.item.price = 0;

                if ($U.hasUndefinedProps(s.item, ['_diag', 'start', 'end'])) {
                    s.warningMsg('Select one available date');
                    return r.route(URL.RDV);
                }

                db.ctrl('Order', 'saveWithEmail', s.item).then(data => {
                    var saved = data.ok;

                    console.info('save-order', data.err)

                    var exists = (data.err === 'ORDER_EXISTS');
                    var taken = (data.err === 'ORDER_TAKEN');
                    if (exists || taken) saved = true;
                    //
                    r.dom(function() {
                        setOrder(data.result);

                        updateAutoSave();
                        if (saved) {
                            evt('success');
                        }
                        if (!saved) {
                            console.warn('save-error', data);
                            return s.warningMsg('An error occured, please try again later');
                        }

                        db.ctrl('Order', 'getById', Object.assign(s._order, {
                                __populate: {
                                    _client: '_id email clientType address discount',
                                    _diag: '_id email clientType address firstName lastName'
                                }
                            }))
                            .then(d => {
                                if (d.ok) {
                                    setOrder(d.result);

                                    // s.keysWhereTime.emit('onItem');
                                }

                            });



                        //
                        if (saved) {
                            s.successMsg('Order created');
                        }
                        if (exists) {
                            //s.warningMsg('Order already exists.');
                            s.successMsg('Order retaken');
                        }
                        if (taken) {
                            //s.successMsg("An order with the same address and time is taken by another client. You can't proceed until you change order time or address.");
                        }



                        s._orderSAVED = saved || exists;
                        s.booking.order.saved = saved || exists || taken;
                        s.booking.order.exists = exists;



                        s.booking.order.taken = (taken == true);
                    });
                    //
                }).err(err => {
                    s.notify('There was a server issue during the order saving proccess. Retrying in 10 seconds. Wait.', {
                        type: 'warning',
                        duration: 100000
                    });
                    setTimeout(s.saveAsync, 10000);
                });
            });
        };






        //require an order to be saved (s._order)
        s.payNOW = (success) => {

            if (orderPaid()) {
                return s.infoMsg('Son ordre de travail a déjà été payée');
            }

            s.validateBooking(() => {
                //
                db.ctrl('Order', 'update', s._order); //async
                db.ctrl('User', 'update', s._user); //async
                //
                var order = s._order;
                openStripeModalPayOrder(order, (token) => {
                    order.stripeToken = token.id;
                    db.ctrl('Order', 'pay', order).then((data) => {
                        if (data.ok) {

                            s._order.status = 'prepaid';

                            s.booking.complete = true;
                            s.booking.payment.complete = true;
                            db.ctrl('Order', 'update', s._order); //async
                            console.info('PAY-OK', data.result);
                            s.notify('Order payment success. We send you an email.', {
                                type: 'success',
                                duration: 100000
                            });

                            r.dom(() => (s._order = {}));
                            updateAutoSave(false);
                            $U.url.clear();
                            r.route(URL.HOME);
                        }
                        else {
                            console.info('PAY-FAIL', data.err);
                            s.notify('There was a server issue during the payment proccess. You pay later from the back-office.', {
                                type: 'warning',
                                duration: 100000
                            });
                        }
                    }).error(() => {
                        s.notify('There was a server issue during the payment proccess. You pay later from the back-office.', {
                            type: 'warning',
                            duration: 100000
                        });
                    });
                }, {
                    config: r.config
                });
                //
            });
            //------
        };







        s.getDate = () => {
            return {
                date: moment(s.item.start).format('DD-MM-YY'),
                start: moment(s.item.start).format('HH[h]mm'),
                end: moment(s.item.end).format('HH[h]mm')
            };
        };

        s.subTotal = () => subTotal(s._order, s.diags, s.basePrice);
        s.sizePrice = () => sizePrice(s._order, s.diags, s.squareMetersPrice, s.basePrice);
        s.totalPrice = (showRounded, opt) => totalPrice(showRounded, s._order, s.diags, s.squareMetersPrice, s.basePrice, Object.assign({
            s: s,
            r: r
        }, opt || {}));

        s.totalPriceRange = (dt) => totalPrice(true, s.item, s.diags, s.squareMetersPrice, s.basePrice, Object.assign({
            s: s,
            r: r,
            dt
        }, {}));

        s.pickTimeRange = function(timeRange) {
            s.item.start = timeRange.start;
            s.item._diag = timeRange._diag;
            s.item.end = timeRange.end;
            s.item.price = timeRange.price;
            if (!timeRange.price) {
                console.warn('time-range invalid price attribute', timeRange);
            }
        };

        s.totalTime = function() {
            var total = 0;
            s.item.diags = s.item.diags || {};
            Object.keys(s.item.diags).forEach(function(mkey) {
                if (!s.item.diags[mkey]) return;
                s.diags.forEach(function(dval, dkey) {
                    if (dval.name == mkey) {
                        dval.time = dval.price / 4;
                        total += dval.time || 0;
                        return false;
                    }
                });
            });
            total = parseInt(parseInt(total) / 10, 10) * 10 + 10;
            var hours = Math.floor(total / 60);
            var minutes = total % 60;
            var t = {
                hours: hours,
                minutes: minutes
            };
            //return normalizeOrderTime(t);
            return t;
        };
        s.totalTime.formatted = () => {
            var time = s.totalTime();
            var hours = time.hours,
                minutes = time.minutes;
            minutes = (minutes < 10) ? '0' + minutes : minutes;
            if (hours > 0) {
                return hours + ':' + minutes + ' hours';
            }
            else {
                return minutes + ' minutes';
            }
        };

    }

]);
