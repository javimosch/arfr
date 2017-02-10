/*global angular*/
/*global _*/
/*global $U*/
/*global moment*/
(function() {
    var app = angular.module('gab_order_details', []);
    app.controller('gab_order_details', [
        'server', '$scope', '$rootScope', '$routeParams', 'gapi', 'stripe', 'dropdown',
        function(db, s, r, params, gapi, stripe, dropdown) {
            s.params = params;
            var Order = (action, data) => db.ctrl('Order', action, data);
            var User = (action, data) => db.ctrl('User', action, data);
            r.__hideNavMenu = true;
            r.navShow = true;
            r.setCurrentCtrl(s);

            s.review = "";
            s.item = {
                info: {}
            };

            dropdown.inject(s, {
                setVal: (name, val) => s.item.info[name] = val,
                getVal: (name) => s.item.info[name],
                defaultLabel: "Select"
            });

            s.debug = {
                moveWhenBackwards: () => {
                    s.item.when = moment().subtract(1, 'days');
                    s.save(true);
                },
                autoAssignBiker: () => {
                    if (!$U.valid(r, '__userRoles.biker')) return console.warn('autoAssignBiker __userRoles expected');
                    s.item.bikersAvailable = s.item.bikersAvailable || [];
                    if (s.item.bikersAvailable.length == 0) {
                        User('getAll', {
                            __rules: {
                                roles: {
                                    $eq: r.__userRoles.biker._id
                                }
                            }
                        }).then(res => {
                            if (res.result) {
                                s.item.bikersAvailable = res.result.map(b => b._id);
                                r.routeParams({
                                    bikersAvailable: s.item.bikersAvailable
                                });
                                r.params.update();
                                s.save(true);
                            }
                        })
                    }
                },
                run: () => {
                    if (!r.isDevEnv()) return;
                    //s.debug.autoAssignBiker();
                }
            };


            s.validReview = (key) => {
                if (!s.item.debriefing) return true;
                var data = s.item.debriefing[key];
                if (!data) return true;
                if (data.content == '') return false;
                if (!_.includes([1, 2, 3], data.score)) return false;
                return true;
            };


            s.validate = (ok) => {
                if (!s.item.from) return r.infoMessage('Complete departure address please');
                if (!s.item.to) return r.infoMessage('Complete arrival address please');
                if (!s.item.when) return r.infoMessage('Complete when please');
                if (!s.validReview('biker')) return r.infoMessage('Biker review requires score and a message please.');
                if (!s.validReview('owner')) return r.infoMessage('Owner review requires score and a message please.');
                ok && ok();
            };

            s.isHistory = () => {
                if (!s.item.when) return false;
                return moment(s.item.when).isBefore(moment());
            };

            s.isPaid = () => {
                return s.item.isPaid;
            };

            s.hasBiker = () => s.item._biker;

            s.successInformation = () => {
                return s.bikerAssignedNotYetSaved();
            };

            s.dangerInformation = () => {
                if (!s.item) return false;
                if (!s.item.info) return false;
                return s.item.info.cancelMotiveCode;
            };

            s.examineBiker = () => {
                r.routeParams({
                    _biker: s.item._biker,
                    cache: {
                        _order: s.item
                    },
                    prevRoute: 'order/' + s.item._id
                });
                r.route('biker/' + s.item._biker._id);
            };

            s.bikerAssignedNotYetSaved = () => s.item._biker && s.item.status == 'created';

            s.isBiker = () => {
                if (!s.item._biker) return false;
                return s.item._biker._id == r.session()._id;
            };

            s.ownerHasDebrief = () => {
                if (!s.item || !s.item.debriefing) return false;
                return s.item.debriefing.owner;
            };

            s.bikerHasDebrief = () => {
                if (!s.item || !s.item.debriefing) return false;
                return s.item.debriefing.biker;
            };

            s.bikerCanDebrief = () => {
                return !s.isCanceled() && s.isHistory() && s.isBiker() && !s.bikerHasDebrief();
            };

            s.activateDebriefMode = () => {
                s.debriefMode = true;
            };

            s.ownerHasDebrief = () => {
                if (!s.item || !s.item.debriefing) return false;
                return s.item.debriefing.owner;
            };
            s.ownerCanDebrief = () => {
                return !s.isCanceled() && s.isHistory() && s.isOwner() && !s.ownerHasDebrief();
            };




            s.hasDebrief = () => {
                if (!s.item.debriefing) return false;
                return Object.keys(s.item.debriefing).length > 0;
            };

            s.reviewStarSelected = null;
            s.reviewStarOver = null;
            s.reviewScoreValues = {
                '1': "Negative",
                '2': "Neutral",
                '3': "Positive"
            };


            s.reviewStars = {};
            s.starHover = (id, val) => {
                if (!s.reviewStars[id]) return;
                s.reviewStars[id].hover = val;
            };
            s.starSelect = (id, val) => {
                if (!s.reviewStars[id]) return;
                s.reviewStars[id].selected = val;
                if (s.item.debriefing && s.item.debriefing[id]) {
                    s.item.debriefing[id].score = val;
                }
            };
            s.reviewScoreLabel = (id, score) => {
                var data = s.reviewStars[id] || null;
                if (!data) return '';
                if (data.hover) return s.reviewScoreValues[data.hover];
                if (data.selected) return s.reviewScoreValues[data.selected];
                return score && s.reviewScoreValues[score.toString()] || '';
            };

            s.reviewStarCls = (id, nro, score) => {
                var data = null;
                if (!s.reviewStars[id]) {
                    s.reviewStars[id] = {
                        hover: false,
                        selected: null
                    };
                    data = s.reviewStars[id];
                }
                else {
                    data = s.reviewStars[id];
                }

                var cls = 'fa fa-star black link';
                var clsE = 'fa fa-star-o black link';
                switch (data.hover) {
                    case null:
                        break;
                    case 1:
                        if (nro > 1) return clsE;
                        else return cls;
                    case 2:
                        if (nro <= 2) return cls;
                        else return clsE;
                    case 3:
                        return cls;
                }

                score = data.selected || score;
                if (score) {
                    cls = 'fa fa-star black';
                    clsE = 'fa fa-star-o black';
                    switch (nro) {
                        case 1:
                            if (score >= 1) return cls;
                            else return clsE;
                        case 2:
                            if (score >= 2) return cls;
                            else return clsE;
                        case 3:
                            return (score >= 3) ? cls : clsE;
                        default:
                            return clsE;
                    }
                }

                return clsE;
            };

            s.reviewPlaceholder = () => {
                if (s.isOwner()) {
                    return "Ex: The biker did well!";
                }
                else {
                    return "Ex: The owner of the order was polite";
                }
            };

            s.saveReview = (key) => {
                var data = s.reviewStars['r'] || null;
                var score = data.selected;

                if (s.review == '') {
                    return r.warningMessage('You need to enter at least 10 charactes for your review.');
                }
                if (!_.includes([1, 2, 3], score)) {
                    return r.warningMessage('You need to enter at an score for your review.');
                }
                s.item.debriefing = s.item.debriefing || {};
                s.item.debriefing[key] = {
                    content: s.review,
                    score: score
                };
                s.debriefMode = false;

                if (s.item.status == 'assigned') {
                    if (!s.item.isPaid) {
                        s.item.status = 'delivered';
                    }
                    else {
                        s.item.status = 'completed';
                    }
                }

                var notificationT = 'GAB_USER_ORDER_' + key.toUpperCase() + '_DEBRIEF';
                //Notification(notificationT, {
                //_user: r.session(),
                //_order:s.item
                //});
                s.item.notifications = s.item.notifications || {};
                s.item.notifications[notificationT] = true;

                s.save(false);
                r.infoMessage('Review saved');
            };


            s.save = (silent) => {

                if (!silent) {
                    if (s.item.status == 'created' && s.item._biker && s.item._biker._id) {
                        var msg = "Assign biker <b>" + s.bikerLabel() + "</b> for <b>" + s.item.priceTTC + " EUR</b> ? (irreversible action)";
                        r.okModal({
                            message: msg,
                            data: {
                                title: 'Confirmation',
                                cancelLabel: "No",
                                okLabel: "Yes"
                            }
                        }, () => {
                            //Notification('GAB_USER_BIKER_FEATURE_REQUEST', {
                            //_user: s.item
                            //});
                            s.item.notifications = s.item.notifications || {};
                            s.item.notifications.GAB_ADMIN_ORDER_BIKER_ASSIGNED = true;
                            s.item.notifications.GAB_ORDER_OWNER_BIKER_ASSIGNED = true;
                            s.item.notifications.GAB_BIKER_YOU_HAS_BEEN_ASSIGNED = true;
                            s.item.status = 'assigned';
                            s.save(true);
                            r.infoMessage('Biker assigned');
                        });
                    }
                }

                s.validate(() => {
                    Order('save', s.item).then(res => {
                        if (!silent) r.infoMessage('Changes saved');
                    });
                });
            };

            s.isAssigned = () => {
                return s.item.status != 'created';
            };



            s.ownerLabel = () => {
                if (!s.item._owner) return '';
                return s.item._owner.nickName || s.item._owner.fullName || s.item._owner.email.substring(0, s.item._owner.email.indexOf('@'));
            }

            s.bikerLabel = () => {
                if (!s.item._biker) return '';
                return s.item._biker.nickName || s.item._biker.fullName || s.item._biker.email.substring(0, s.item._biker.email.indexOf('@'));
            }

            s.isOwner = () => {
                if (!s.item._owner) return false;
                return r.session()._id == s.item._owner._id;
            };

            s.hasApplied = () => {
                return _.includes(s.item.bikersAvailable, r.session()._id);
            };

            s.apply = () => {
                //apply for assignment
                s.read(() => {
                    s.item.bikersAvailable = s.item.bikersAvailable || [];
                    s.item.bikersAvailable.push(r.session()._id);
                    Order('update', {
                        _id: s.item._id,
                        bikersAvailable: s.item.bikersAvailable
                    }).then(() => {
                        r.route('assignment');
                    });
                    r.infoMessage('You applied for the assignment');
                });
            }

            s.hasPrices = () => !_.includes(['canceled', 'created'], s.item.status) || s.item.priceTTC !== undefined;

            s.ableToSave = () => {
                return !_.includes(['canceled', 'completed'], s.item.status);
            };

            s.ableToPay = () => {
                return !s.item.isPaid &&
                    s.isOwner() &&
                    s.item.priceTTC &&
                    !_.includes(['canceled', 'created'], s.item.status);
            };

            s.pay = () => {
                if (s.item.isPaid) {
                    return r.infoMessage('Already paid');
                }
                stripe.openPopup({
                    description: 'Order Payment',
                    amount: s.item.priceTTC
                }, (res) => {
                    var payload = Object.assign(_.cloneDeep(s.item), {
                        stripeToken: res.id
                    });
                    Order('pay', payload).then(res => {
                        if (res.ok) {
                            s.item.isPaid = true;

                            if (s.item.status == 'delivered') {
                                s.item.status = 'completed';
                            }

                            r.successMessage('Payment success', 10000);

                            s.save(true);
                        }
                        console.info(res);
                    });


                }, {
                    email: s.item._owner.email
                });
            };

            s.isCanceled = () => s.item.status == 'canceled';

            s.isCompleted = () => s.item && s.item.status == 'completed';

            s.ableToCancel = () => {
                return s.item.status !== 'canceled' && moment(s.item.when).isAfter(moment(), 'hour') && s.isPaid();
            };
            s.cancel = () => {
                r.okModal({
                    title: 'Cancel confirmation',
                    message: "If you continue the order will be canceled and the biker (if any assigned), will be notified.",
                    data: {
                        cancelLabel: "No",
                        okLabel: "Yes"
                    }
                }, () => {
                    s.item.status = 'canceled';
                    s.save(true);
                });
            };



            s.ableToCalculatePrices = () => {
                if (s.item.status !== 'created') return false;
                if (!$U.valid(s, 'item._biker._id')) {
                    return false;
                }
                if (!$U.valid(s, 'item.from')) {
                    return false;
                }
                if (!$U.valid(s, 'item.to')) {
                    return false;
                }
                if (!$U.val(s, 'item._biker.eurxkm')) {
                    console.log('ableToCalculatePrices false eurxkm')
                    return false;
                }
                if (!$U.val(s, 'item._biker.eurxkmbase') && $U.val(s, 'item._biker.eurxkmbase') != 0) {
                    console.log('ableToCalculatePrices false eurxkmbase')
                    return false;
                }
                if (!$U.valid(s, 'item.google.distance')) {
                    s.calculateDistance(s.calculatePrices);
                    return false;
                }
                return true;
            }

            s.calculateDistance = (cb) => {
                if ($U.valid(s, 'item.google.distance')) return cb && cb();
                if (!$U.valid(s, 'item.from')) return false;
                if (!$U.valid(s, 'item.to')) return false;
                if (!gapi.__calling) {
                    gapi.__calling = true;
                    gapi.bike_distance(s.item.from, s.item.to, (res) => {
                        s.item.google = s.item.google || {};
                        s.item.google.distance = res.distance;
                        s.item.google.duration = res.duration;
                        r.dom();
                        cb && cb();
                        gapi.__calling = false;
                    });
                }
            };

            s.calculatePrices = () => {
                if (!s.ableToCalculatePrices()) return false;

                //coursier revenue
                var meters = s.item.google.distance.value;
                s.item.bikerRevenueHT = meters * 0.001 * s.item._biker.eurxkm + s.item._biker.eurxkmbase;
                if (s.item.bikerRevenueHT < 1) s.item.bikerRevenueHT = 1; //minimum price to charge 1EUR


                //our revenue
                s.item.commissionPorc = 0.05;
                s.item.commissionPrice = s.item.bikerRevenueHT * s.item.commissionPorc;


                //final price.
                var subtotal = s.item.bikerRevenueHT + s.item.commissionPrice;


                s.item.priceHT = (subtotal + 0.30) / 1 - 0.029;

                //we add stripe fee inside your comission price
                s.item.commissionPrice += (s.item.priceHT - subtotal);


                //iva 20 (disabled)
                var ivaPorc = 0; //0.2
                s.item.priceTTC = s.item.priceHT + (s.item.priceHT * ivaPorc);






                r.dom();
                return true;
            };


            s.$watch('item.from', recalculateDistance);
            s.$watch('item.to', recalculateDistance);

            function recalculateDistance() {
                if (!s.item._id) return;
                if (!s.__recalculateDistance) return s.__recalculateDistance = true;
                if (s.item.google) {
                    delete s.item.google;
                }
                s.calculateDistance(() => {
                    if (s.item._biker) {
                        s.calculatePrices();
                    }
                });
            }

            s.assignBiker = (_biker) => {
                s.item._biker = _biker;
                s.calculatePrices();
                console.log('assigned', _biker);
            };

            r.routeParams({
                assign: s.assignBiker
            });



            var CANCEL_MOTIVES = {
                WHEN_PASSED_WITHOUT_ASSIGNMENT: 'WHEN_PASSED_WITHOUT_ASSIGNMENT',
                TIME_WITHOUT_ASSIGNATION_EXCEEDED: 'TIME_WITHOUT_ASSIGNATION_EXCEEDED'
            };

            s.cancelMotive = () => {
                if (!s.item.info) return
                var code = s.item.info.cancelMotiveCode;
                if (!code) return '';
                switch (code) {
                    case CANCEL_MOTIVES.WHEN_PASSED_WITHOUT_ASSIGNMENT:
                        return "The 'When' date its after the current time and nobody was assigned, therefore, the order was canceled automatically.";
                    case CANCEL_MOTIVES.TIME_WITHOUT_ASSIGNATION_EXCEEDED:
                        return "Every unassigned order has a limited lifetime of thirty minutes. If this happens to you serveral times it means that there is not enough bikers to respond to your order at the moment. We sorry.";
                    default:
                        return "The following cancel motive its unkown '" + code.toUpperCase() + "'";
                }
            };

            function cancelWithMotive(cancelMotiveCode) {
                s.item.status = 'canceled';
                s.item.info = s.item.info || {};
                s.item.info.cancelMotiveCode = cancelMotiveCode;
                s.save(true);
                r.dom();
            }

            s.checkIntegrity = () => {
                if (!s.item) return false;
                if (moment(s.item.when).isBefore(moment()) && !s.item._biker) {
                    cancelWithMotive(CANCEL_MOTIVES.WHEN_PASSED_WITHOUT_ASSIGNMENT);
                }

                if (s.item.status == 'delivered' && s.item.isPaid) {
                    s.item.status = 'completed';
                    s.save(true);
                    r.dom();
                }

                if (s.item.info && s.item.info.cancelMotiveCode && !s.isCanceled()) {
                    return cancelWithMotive(s.item.info.cancelMotiveCode);
                }

            };

            function readAfter(cb) {
                s.item.info = s.item.info || {};
                s.debug.run();
                s.calculateDistance();
                //_biker from $params
                if (!s.item._biker && r.params._biker) {
                    s.assignBiker(r.params._biker);
                    delete r.params._biker;
                }
                s.checkIntegrity();
                if (cb) cb();
                if (!s.item._biker && s.item.bikersAvailable && s.item.bikersAvailable.length > 0) {
                    r.routeParams({
                        bikersAvailable: s.item.bikersAvailable
                    });
                    if (r.params.update) {
                        r.params.update();
                    }
                }
            }


            function getPayload() {
                var defaultPayload = {
                    __populate: {
                        _biker: "email firstName nickName phone eurxkm eurxkmbase",
                        _owner: "email firstName nickName phone"
                    },
                    _id: params.id,
                };

                return defaultPayload;
            }

            s.read = (cb) => {
                if (r.params && r.params.cache && r.params.cache._order) {
                    s.item = r.params.cache._order;
                    readAfter(cb);
                    console.info('debug read from params');
                    delete r.params.cache._order;
                    return;
                }
                console.log('fetching ' + getPayload()._id);
                Order('get', getPayload()).then(res => {
                    s.item = res.ok && res.result || s.item;
                    readAfter(cb);
                });
            };

            if (params.id) {
                s.read();
            }
        }
    ]);
})();