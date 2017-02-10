/*global angular*/
/*global _*/
/*global $U*/
(function() {
    var app = angular.module('gab_profile', []);
    app.controller('gab_profile', [
        'server', '$scope', '$rootScope', 'gapi', '$routeParams',
        function(db, s, r, gapi, $routeParams) {
            s.$routeParams = $routeParams;
            r.toggleNavbar(true);
            r.secureSection(s);
            r.setCurrentCtrl(s);

            var User = (action, data) => db.ctrl('User', action, data);
            var Role = (action, data) => db.ctrl('Role', action, data);
            var Notification = (action, data) => db.ctrl('Notification', action, data);

            s.item = {
                roles: []
            };

            s.orderTypeLabel = () => s._order.type && s.orderTypes[s._order.type] || s.orderTypeLabelValue || 'Select';
            s.orderTypes = {
                ATOB: "A TO B"
            };
            s.selectOrderType = (type, label) => {
                s.orderTypeLabelValue = label;
                s._order.type = type;
            }

            s.validate = (ok) => {
                //if (!s.item.email) return r.infoMessage('Complete departure address please');

                if (r.userHasRole('biker')) {
                    if (!s.item.nie) return r.infoMessage('Complete Personal ID (biker requirement) please');
                }

                if (!s.item.pwd) return r.infoMessage('Complete password please');
                ok && ok();
            };

            s.back = () => {
                r.route(r.params.prevRoute);
            };


            s.debug = {
                grantRole: (code) => {
                    Role('get', {
                        code: code
                    }).then(res => {
                        if (res.ok && res.result) {
                            if (!_.includes(s.item.roles, res.result._id)) {
                                s.item.roles.push(res.result._id);
                            }
                            r.session(s.item);
                            s.save(true);
                            console.log('role granted', code);
                        }
                    });
                },
                readRoles: () => {
                    Role('getAll').then(res => {
                        console.info(res.result);
                    })
                },
                createRoles: () => {
                    Role('save', {
                        code: "admin",
                        description: 'This role enables admin features.'
                    });
                    Role('save', {
                        code: "biker",
                        description: 'This role enables bikers features.'
                    });
                    Role('save', {
                        code: "company",
                        description: 'This role enables company features.'
                    });
                }
            };

            s.save = (silent) => {
                r.session(s.item);
                s.validate(() => {
                    User('save', s.item).then(res => {
                        if (!silent) r.infoMessage('Profile saved');
                    });
                });
            };

            function getPayload() {
                if ($routeParams && $routeParams.id) {
                    return {
                        _id: $routeParams.id
                    };
                }
                return {
                    _id: r.session()._id
                };
            }

            User('get', getPayload()).then(res => {
                console.info(res);
                if (res.ok) {
                    s.item = res.result || s.item;
                    s.item.extra = s.item.extra || {};
                }
            });

            s.ableToRequestCoursierAccountFeature = () => {
                return !r.userHasRole('biker') &&
                    (!s.item.notifications ||
                        s.item.notifications && !s.item.notifications.GAB_USER_BIKER_FEATURE_REQUEST);
            };

            s.request = () => {
                r.okModal({
                    title: 'Confirmation',
                    message: "If you request the coursier account feature, an admin will get in touch with you soon, do you want to continue?",
                    data: {
                        cancelLabel: "Cancel",
                        okLabel: "Continue"
                    }
                }, () => {
                    Notification('GAB_USER_BIKER_FEATURE_REQUEST', {
                        _user: s.item
                    });
                    s.item.notifications = s.item.notifications || {};
                    s.item.notifications.GAB_USER_BIKER_FEATURE_REQUEST = true;
                    s.save(true);
                    r.infoMessage('Request sended');
                });
            };

            s.hasRoles = () => s.item && s.item.roles.length > 0;

            s.hasNotifications = () => {
                if (!s.item) return false;
                if (!s.item.notifications) return false;
                return Object.keys(s.item.notifications).length > 0;
            }


        }
    ]);
})();