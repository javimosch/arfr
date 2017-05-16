/*global angular*/
/*global _*/
/*global moment*/
/*global $U*/
/*global $D*/

(function() {
    var app = angular.module('app.diag', []);

    app.directive('diagsList', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, server) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {},
            templateUrl: 'views/directives/directive.fast-crud.html',
            link: function(s, elem, attrs) {},
            controller: function($scope, $element, $attrs, $transclude) {
                var r = $rootScope,
                    db = server,
                    s = $scope;
                s.title = "";
                r.routeParams({
                    prevRoute: 'diags'
                });

                function update() {
                    db.ctrl('User', 'getAll', {
                        userType: 'diag'
                    }).then((res) => {
                        res.result = _.orderBy(res.result, ['priority'], ['asc']);
                        s.model.update(res.result)
                    });
                }
                s.model = {
                    click: (item, index) => {
                        r.routeParams({
                            item: item,
                        });
                        r.route('diags/edit/' + item._id);
                    },
                    buttons: [{
                        label: "Refresh",
                        type: () => "btn diags-btn bg-azure-radiance margin-left-0 margin-right-1",
                        click: () => update()
                    }, {
                        label: "New Diag",
                        type: () => "btn diags-btn bg-azure-radiance",
                        click: () => r.route('diags/edit/-1')
                    }],
                    columns: [{
                        label: 'Priority',
                        name: 'priority'
                    }, {
                        label: "Description",
                        name: "firstName",
                        format: (x, o) => o.firstName+((o.lastName)?', '+o.lastName:'')
                    }, {
                        label: "Email",
                        name: 'email'
                    }, {
                        label: "Tel",
                        name: "fixedTel",
                        format: (v, item) => item.fixedTel || item.cellPhone || ''
                    }, {
                        label: "Comission",
                        name: "commission"
                    },{
                        label: "Activated",
                        name: "commission",
                        format:(v,item)=>!item.disabled
                    }],
                    items: []
                };
                update();
            }
        };
    });
    app.directive('diagExceptionList', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, server, $mongoosePaginate, $routeParams) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                //model: "=model"
            },
            templateUrl: 'views/directives/directive.fast-crud.html',
            link: function(s, elem, attrs) {
                var r = $rootScope,
                    dbPaginate = $mongoosePaginate.get('TimeRange'),
                    params = $routeParams;
                var db = server;
                var n = attrs.name;
                r.secureSection(s);
                //
                if (r.userIs('client')) {
                    r.handleSecurityRouteViolation();
                }

                function update(items, cb) {
                    if (items) {
                        s.model.update(items);
                        return;
                    }
                    var rules = {
                        __populate: {
                            '_user': 'email'
                        }
                    };

                    if (r.userIs('diag')) {
                        rules._user = r.session()._id;
                    }

                    if (params && params.id) {
                        rules._user = params.id;
                    }

                    if (!rules._user || rules._user.toString() == '-1') {
                        return console.warn('time-range: insufficients rules.');
                    }

                    dbPaginate.ctrl(rules, s.model).then((res) => {
                        if (res.ok) {
                            if (cb) {
                                cb(res.result);
                            }
                            else {
                                s.model.update(res.result, null);
                            }
                        }
                    });
                }

                var userId = () => {
                    if (r.userIs('diag')) return r.session()._id;
                    if (params.id) return params.id;
                    return null;
                };
                var prevRoute = () => {
                    if (params.id) {
                        return 'diags/edit/' + params.id;
                    }
                    else {
                        return 'exceptions';
                    }
                };

                var columns = [];
                if (r.userIs('admin') && (params && params.id || null) == null) {
                    columns.push({
                        label: 'Diag',
                        name: '_user',
                        format: (v, item) => item._user.email
                    });
                }
                columns.push({
                    label: "Description",
                    name: 'description'
                }, {
                    label: "Start",
                    name: 'start',
                    format: (v, item) => {
                        if (item.repeat !== 'none') return r.momentTime(item.start);
                        return moment(item.start).format('DD-MM-YY HH[h]mm')
                    }
                }, {
                    label: "End",
                    name: 'end',
                    format: (v, item) => {
                        if (item.repeat !== 'none') return r.momentTime(item.end);
                        return moment(item.end).format('DD-MM-YY HH[h]mm')
                    }
                }, {
                    label: "Repeat rule",
                    name: 'repeat',
                    format: (v, item) => {
                        if (item.repeat == 'none') return 'Specific date';
                        if (item.repeat == 'day') return 'Daily';
                        if (item.repeat == 'week') return 'Weekly';
                        return 'Error';
                    }
                });

                s.model = {
                    title: 'Working Exceptions',
                    paginate: (cb) => update(null, cb),
                    init: () => update(),
                    remove: (item, index) => {
                        var msg = 'Delete ' + item.description + ' ' + item.startFormat + ' - ' + item.endFormat + ' (' + item.dayFormat + ')';
                        s.confirm(msg, () => {
                            db.ctrl('TimeRange', 'remove', {
                                _id: item._id
                            }).then(() => {
                                update();
                            });
                        });
                    },
                    click: (item, index) => {
                        r.routeParams({
                            item: item,
                            prevRoute: prevRoute()
                        });
                        r.route('exceptions/edit/' + item._id);
                    },
                    buttons: [{
                        label: "Refresh",
                        type: () => "btn diags-btn bg-azure-radiance spacing-h-1",
                        click: () => update()
                    }, {
                        label: "New",
                        type: () => "btn diags-btn bg-azure-radiance spacing-h-1",
                        click: () => {
                            r.routeParams({
                                item: {
                                    _user: userId()
                                },
                                prevRoute: prevRoute()
                            });
                            r.route('exceptions/edit/-1');
                        }
                    }],
                    columns: columns
                };

            }
        };
    });
    app.controller('diagExceptionEdit', ['server', '$scope', '$rootScope', '$routeParams', 'focus',
        function(db, s, r, params, focus) {
            //
            s.item = {
                start: null,
                end: null,
                repeat: 'none',
                description: '',
                start: new Date(),
                end: new Date()
            };
            var isEdit = params.id.toString() !== '-1';
            $U.expose('edit', s);
            //DAYS SELECTOR
            s.days = (() => {
                var o = {
                    label: 'Day',
                    selected: '',
                    items: [],
                    val: -1,
                    select: (val) => {
                        o.items.forEach((v) => {
                            if (v.val.toString() == val.toString()) {
                                o.click(v);
                            }
                        });
                    },
                    click: (v) => {
                        o.selected = v.label || v;
                        o.val = v.val;
                        if (s.item.start) {
                            s.item.start = moment(s.item.start).day((o.val.toString() === '-1') ? 1 : o.val)._d;
                        }
                        if (s.item.end) {
                            s.item.end = moment(s.item.end).day((o.val.toString() === '-1') ? 1 : o.val)._d;
                        }
                    }
                };
                var m = moment();
                o.items.push({
                    label: "(Choice a day)",
                    val: ''
                }, {
                    label: "Every day",
                    val: '-1'
                });
                for (var x = 1; x <= 7; x++) {
                    m.day(x);
                    o.items.push({
                        label: m.format('dddd'),
                        val: x
                    });
                }
                s.$watch('repeat', (v) => {
                    if (v === 'day') s.days.select(-1);
                })
                o.selected = o.items[0].label;
                return o;
            })();
            //TIME-PICKER-DATA
            s.timeRange = {
                hstep: 1,
                mstep: 10,
                minDate: moment().date(1),
            };
            //DATE-TIME-PICKER-DATA
            s.datepicker = {
                minDate: moment().toDate(), //.add(1, 'day') //today!
                maxDate: moment().add(60, 'day').toDate(),
                initDate: new Date()
            };
            s.getDiags = function(val) {
                return db.http('User', 'getAll', {
                    userType: 'diag',
                    __rules: {
                        disabled: {
                            $ne: true
                        },
                    },
                    __regexp: {
                        email: val
                    }
                }).then(function(res) {
                    return res.data.result;
                });
            };
            s.onLoad = (isNew) => {
                if (isNew) {
                    s.item.start = moment().hour(9).minutes(0)._d;
                    if (r.params && r.params.item) {
                        s.item = Object.assign(s.item, r.params.item);
                        if (typeof s.params.item._user == 'string') {
                            db.ctrl('User', 'get', {
                                _id: r.params.item._user,
                                __select: 'email'
                            }).then(d => {
                                if (d.ok) s.item._user = d.result;
                            });
                        }
                        delete r.params.item;
                    }
                    return;
                }
                if (s.repeat == 'week') {
                    s.days.select(moment(s.item.start).day());
                }
            };
            if (isEdit) {
                if (r.params && r.params.item) {
                    s.item = r.params.item;
                    r.params.item = null;
                    s.onLoad();
                }
                else {
                    db.ctrl('TimeRange', 'get', {
                        _id: params.id,
                        __populate: {
                            '_user': 'email'
                        }
                    }).then(d => {
                        if (d.ok) {
                            s.item = d.result;
                            s.onLoad();
                        }
                        else {
                            r.notify({
                                message: 'Loading error, try later',
                                type: "warning"
                            });
                        }
                    })
                }
            }
            else {
                s.onLoad(true);
            }
            s.save = () => {
                db.ctrl('TimeRange', 'createUpdate', s.item).then((result) => {
                    r.route(r.params && r.params.prevRoute || 'dashboard');
                });
            };
            s.cancel = () => r.route(r.params && r.params.prevRoute || 'dashboard');
            s.delete = () => {
                var msg = 'Delete ' + s.item.description + ' ' + s.item.startFormat + ' - ' + s.item.endFormat + ' (' + s.item.dayFormat + ')';
                s.confirm(msg, () => {
                    db.ctrl('TimeRange', 'remove', {
                        _id: s.item._id
                    }).then(() => {
                        s.cancel();
                    });
                });
            };
            s.rangeCollideWithOrder = (yes, no) => {
                db.ctrl('Order', 'getAll', {
                    __select: 'start end',
                    _diag: s.item._user
                }).then((d) => {
                    if (d.ok) {
                        d.result.forEach(v => {
                            if ($D.rangeCollide(v.start, v.end, s.item.start, s.item.end)) {
                                return yes(v);
                            }
                        });
                        return no();
                    }
                    else {
                        console.warn('rangeCollide order fetch error');
                        return no();
                    }
                }).error(() => {
                    console.warn('rangeCollide order fetch error');
                });
            };
            s.validate = () => {
                if (!s.item) return console.warn('item missing.');
                if (!s.item._user) return console.warn('item._user missing.');

                s.rangeCollideWithOrder((order) => {
                    //r.momentDateTime(order.start);
                    return r.warningMessage('An order exists for this date.');
                }, () => {

                    $U.ifThenMessage([
                        [!s.item._user, '==', true, 'Diag required'],
                        [s.item.repeat == 'week' && s.days.val.toString() === '-1', '==', true, 'Choice a day'],
                        [_.isNull(s.item.start) || _.isUndefined(s.item.start), '==', true, 'Start date required'],
                        [_.isNull(s.item.end) || _.isUndefined(s.item.end), '==', true, 'Start date required'],
                        [moment(s.item.start || null).isValid(), '==', false, "Start date invalid"],
                        [moment(s.item.end || null).isValid(), '==', false, "End date invalid"],
                        [s.item.repeat != 'none' && moment(s.item.end).isValid() && moment(s.item.start).isValid() && !moment(s.item.end).isSame(moment(s.item.start), 'day'), '==', true, 'Start / End dates need to be in the same day.'],
                        [moment(s.item.end).isValid() && moment(s.item.end).isBefore(moment(s.item.start), 'hour'), '==', true, 'End date cannot be lower than Start date']
                    ], (m) => {
                        if (typeof m[0] !== 'string') {
                            r.notify(m[0](), 'warning');
                        }
                        else {
                            r.notify(m[0], 'warning');
                        }
                    }, s.save);
                });
            }
        }
    ]);
})();
