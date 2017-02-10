/*global angular*/
/*global _*/
/*global $U*/
/*global moment*/

var app = angular.module('app.user', []);




app.controller('adminUsers', [

    'server', '$scope', '$rootScope',
    function(db, s, r) {
        //        console.info('app.admin.user:adminUsers');
        //
        r.toggleNavbar(true);
        r.secureSection(s);
        s.selectedItems = [];
        s.items = [];
        //
        if (r.userIs(['diag', 'client'])) {
            return r.handleSecurityRouteViolation();
        }
        //
        s.click = function(item, optionalRouteForEdition) {
            r.route((optionalRouteForEdition || 'users/edit/') + item._id);
        };
        s.create = function(optionalRouteForEdition) {
            r.route(optionalRouteForEdition || 'users/edit/-1');
        };
        s.delete = function(item) {
            s.confirm('Remove ' + s.selectedItems.length + ' item/s?', function() {
                console.log('adminUsers:removeAll:in-progress');
                s.message('deleting . . .', 'info');
                s.requesting = true;
                db.ctrl('User', 'removeAll', {
                    ids: s.selectedItems
                }).then(function(res) {
                    s.requesting = false;
                    s.message('deleted', 'info');
                    read();
                    console.info('adminUsers:removeAll:success', r.data);
                }).error(function(err) {
                    s.requesting = false;
                    s.message('error, try later.', 'danger');
                    console.warn('adminUsers:removeAll:error', err);
                });
            });
        };
        s.select = function() {
            if (window.event) {
                window.event.stopPropagation();
            }
        };

        function read() {
            s.message('Loading . . .', 'info');
            db.ctrl('User', 'getAll', {}).then(function(r) {
                s.items = r.result;
                s.message('Loaded', 'success', 1000);
            });
        }
        r.dom(read, 0);

    }
]);

app.controller('adminUsersEdit', [

    'server', '$scope', '$rootScope', '$routeParams', 'tpl',
    function(db, s, r, params, tpl) {
        //        console.info('app.admin.user:adminUsersEdit');
        //
        r.toggleNavbar(true);
        r.secureSection(s);
        r.dom();
        //
        $U.expose('s', s);
        //
        s.item = {
            email: '',
            password: ''
        };

        if (r.params && r.params.item) {
            s.item = Object.assign(r.params.item);
            delete r.params.item;
        }

        s.original = _.clone(s.item);
        //
        s.types = {
            selected: '(Choice a user type)',
            items: [{
                label: 'Admin',
            }, {
                label: 'Diag',
            }, {
                label: 'Client'
            }],
            click: (choice) => {
                if (typeof choice === 'string') {
                    for (var x in s.types.items) {
                        if (s.types.items[x].label.toString().toLowerCase() == choice.toString().toLowerCase()) {
                            s.types.selected = s.types.items[x].label;
                            s.item.userType = s.types.items[x].label.toString().toLowerCase();
                        }
                    }
                    return;
                }
                else {
                    s.item.userType = choice.label.toString().toLowerCase();
                    s.types.selected = choice.label;
                }
            }
        };
        //
        if (params && params.id && params.id.toString() !== '-1') {
            //            console.info('adminUsersEdit:params', params);
            r.dom(read, 1000);
        }
        else {

            if (r.userIs(['diag', 'client'])) {
                //can't create an user
                return r.handleSecurityRouteViolation();
            }

            reset();
        }
        s.back = () => {
            if (r.userIs(['diag', 'client'])) {
                r.route('dashboard');
            }
            else {
                if (r.params && r.params.prevRoute) {
                    var _r = r.params.prevRoute;
                    delete r.params.prevRoute;
                    return r.route(_r);
                }
                else {
                    //r.route('users');
                    console.warn('r.params.prevRoute required');
                    r.route('dashboard');
                }
            }
        };
        //


        s.notifyClientNewAccount = () => {
            db.ctrl('Notification', 'CLIENT_NEW_ACCOUNT', s.item).then(res => {
                console.info('RTA', res.result);
            });
        };

        

        s.cancel = function() {
            s.back();
        };

        s.isCurrent = () => {
            return r.session()._id == s.item._id;
        };

        s.isAdmin = () => s.item.userType == 'admin';

        s.isClient = () => s.item.userType == 'client';

        s.validate = () => {
            $U.ifThenMessage([
                [!s.item.userType, '==', true, "User type est nécessaire"],
                [!s.item.firstName, '==', true, "Prénom est nécessaire"],
                [!s.item.email, '==', true, "Email est nécessaire"],
                [!s.item.password, '==', true, "Password est nécessaire"],
                [s.item.userType !== 'admin' && !s.item.clientType, '==', true, "clientType est nécessaire"],

                [s.isClient() && s.item.discount == undefined, '==', true, "Discount est nécessaire"],
                [s.isClient() && isNaN(s.item.discount), '==', true, "Discount allowed values are 0..100"],
                [s.isClient() && (s.item.discount < 0 || s.item.discount > 100), '==', true, "Discount allowed values are 0..100"]

            ], (m) => {
                s.message(m[0], 'warning', 0, true);
            }, s.save);
        };

        
        

        s.save = function() {
            db.ctrl('User', 'getAll', {
                email: s.item.email,
                userType: s.item.userType,
                clientType: s.item.clientType
            }).then(function(data) {
                var result = data.result;

                if (data.result.length > 0) {
                    var _item = data.result[0];
                    if (s.item._id && s.item._id == _item._id) {
                        _save(); //same user
                    }
                    else {
                        s.message('Email address in use.');
                    }
                }
                else {
                    _save(); //do not exist.
                }
            });

            function _save() {
                db.ctrl('User', 'save', s.item).then(function(res) {
                    if (res.ok) {

                        //if current user, update session.
                        if (res.result) {
                            if (res.result._id == r.session()._id) {
                                r.session(res.result);
                            }
                        }



                        






                        s.message('saved', 'success');
                        s.back();
                    }
                    else {
                        s.message('error, try later', 'danger');
                    }
                }).error(function(_err) {
                    s.message('error, try later.', 'danger');
                });
            }

        };
        s.delete = function() {
            userHasRelatedOrders().on('yes', (_err, r) => {
                s.relatedOrders = r.relatedOrders || [
                    'data.relatedOrders required'
                ];
                s.okModal({
                    messageEl: tpl.compile('user.delete.associated-orders', s)
                }, () => {
                    delete s.relatedOrders;
                });

            }).on('no', () => {
                _proceedDelete();
            });

            function _proceedDelete() {
                s.confirm('Delete User ' + s.item.email + ' ?', function() {
                    db.ctrl('User', 'remove', {
                        _id: s.item._id
                    }).then(function(res) {
                        s.message('deleted', 'info');
                        reset();
                        s.back();
                    }).error(function(_err) {
                        s.requesting = false;
                        s.message('error, try later.', 'danger');
                    });
                });
            }
        };

        function reset() {
            s.item = _.clone(s.original);
        }

        function read() {

            if (r.userIs(['diag', 'client'])) {
                //only can see his own info
                if (params.id !== r.session()._id) {
                    return r.handleSecurityRouteViolation();
                }
            }

            //s.message('Loading . . .', 'info');

            s.requesting = true;
            db.ctrl('User', 'get', {
                _id: params.id
            }).then(function(res) {
                s.item = res.result;
                if (!res.ok) {
                    s.message('not found, maybe it was deleted!', 'warning', 5000);
                }
                else {
                    s.types.click(s.item.userType);
                    //s.message('Loaded', 'success', 2000);
                }
            });
        }


        function userHasRelatedOrders(cb) {
            var time = (d) => moment(d).format('HH:mm');
            var descr = (_order) => _order.address + ' (' + time(_order.start) + ' - ' + time(_order.end) + ')'
            return $U.MyPromise((resolve, error, emit) => {
                if (s.item.userType === 'admin') {
                    return emit('no'); //admin has no orders associated.
                }
                var rules = {
                    __select: "start end address" //we only need those 3 fields to build the description.
                };
                if (s.item.userType === 'client') {
                    rules['_client'] = s.item._id
                }
                if (s.item.userType === 'diag') {
                    rules['_diag'] = s.item._id
                }
                db.ctrl('Order', 'getAll', rules).then(data => {
                    if (data.ok && data.result && data.result.length > 0) {
                        var relatedOrders = [];
                        data.result.forEach(_order => {
                            relatedOrders.push(descr(_order));
                        });
                        emit('yes', null, {
                            relatedOrders: relatedOrders
                        });
                    }
                    else {
                        emit('no');
                    }
                });
            });
        }

    }
]);
