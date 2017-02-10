/*global angular*/
/*global $U*/
/*global moment*/
/*global _*/
(function() {
    var app = angular.module('app.admin', []);

    app.controller('adminDashboard', [

        'server', '$scope', '$rootScope',
        function(db, s, r) {
            //        console.info('app.admin.login:adminDashboard');
            //
            r.toggleNavbar(true);
            r.secureSection(s);
        }
    ]);


   



    app.directive('adminBalance', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, server) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                //model: "=model"
            },
            templateUrl: 'views/diags/backoffice/partials/admin-balance.html',
            link: function(s, elem, attrs) {
                var r = $rootScope;
                var ws = server;
                var n = attrs.name;

                r.logger.addControlledErrors(['StripeConnectionError']);

                ws.ctrl('Payment', 'balance').then((data) => {
                    //console.log('adminBalance:data',data);
                    if (!data.ok) return r.notify(data.err && data.err.message || 'Server error when connecting with Stripe.');
                    var b = {};
                    var out = data.result;
                    b.available = _.sumBy(out.available, function(o) {
                        return o.amount;
                    }) / 100; //eur
                    b.pending = _.sumBy(out.pending, function(o) {
                        return o.amount;
                    }) / 100; //eur
                    b.livemode = out.livemode;
                    s.b = b;
                })

                ws.ctrl('Stats', 'general').then((data) => {
                    s.g = data.result;
                })

            }
        };
    });



    app.directive('adminTurnover', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, server) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                //model: "=model"
            },
            templateUrl: 'views/directives/directive.fast-crud.html',
            link: function(s, elem, attrs) {
                var r = $rootScope;
                var ws = server;
                var n = attrs.name;
                s.title = "Balance details";

                function update() {
                    var data = {
                        __populate: {
                            '_client': 'email userType',
                            '_diag': 'email userType'
                        }
                    };

                    if (r.userIs(['diag'])) {
                        data['_diag'] = r.session()._id;
                    }
                    if (r.userIs(['client'])) {
                        data['_client'] = r.session()._id;
                    }

                    ws.ctrl('Payment', 'balanceTransactions', data).then((res) => {
                        if (res.ok) {

                            res.result.data.forEach((v) => {
                                v.amount = v.amount / 100;
                                v.created = moment(v.created).format('DD/MM/YY HH:MM');

                                v._order = {
                                    _id: '!@#!@#!@',
                                    description: 'Zararara'
                                };
                                //v.date = moment(v.start).format('dddd, DD MMMM')
                                //v.start = moment(v.start).format('HH:mm');
                                //v.end = moment(v.end).format('HH:mm');
                            });
                            //                        console.info('TRANSACTIONS', res.result.data);
                            s.model.update(res.result.data);
                        }
                    });
                }


                s.model = {
                    click: (item, index) => {
                        var data = {};
                        ws.localData().then(function(d) {
                            Object.assign(data, d);
                        });

                        ws.ctrl('Payment', 'associatedOrder', {
                            source: item.source
                        }).then((data) => {
                            item = Object.assign(data.result);
                            _open();
                        });

                        function _open() {
                            s.open({
                                title: 'Balance Transaction',
                                data: data,
                                evts: {
                                    'init': []
                                },
                                item: item,
                                templateUrl: 'views/diags/backoffice/partials/admin-balance-details.html',
                                callback: (item) => {}
                            });
                        }
                    },
                    buttons: [{
                        label: "Refresh",
                        type: () => "btn btn-success spacing-h-1",
                        click: () => update()
                    }],
                    columns: [{
                        label: "Description",
                        name: 'description'
                    }, {
                        label: "Amount (eur)",
                        labelCls: () => ({
                            'text-right': true
                        }),
                        name: 'amount',
                        align: 'right'
                    }, {
                        label: "Created",
                        name: "created"
                    }],
                    items: []
                };
                update();
                //                console.log('directive.exceptions.linked');
            }
        };
    });

    app.directive('adminsList', function(
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
                    item: {
                        userType: 'admin'
                    },
                    prevRoute: 'administrators'
                });

                function update() {
                    db.ctrl('User', 'getAll', {
                        userType: 'admin'
                    }).then((res) => s.model.update(res.result));
                }
                s.model = {
                    click: (item, index) => {
                        r.routeParams({
                            item: item,
                        });
                        r.route('administrators/edit/' + item._id);
                    },
                    buttons: [{
                        label: "Refresh",
                        type: () => "btn diags-btn bg-azure-radiance margin-left-0 margin-right-1",
                        click: () => update()
                    }, {
                        label: "New Admin",
                        type: () => "btn diags-btn bg-azure-radiance",
                        click: () => r.route('administrators/edit/-1')
                    }],
                    columns: [{
                        label: "Email",
                        name: 'email'
                    }, {
                        label: "Tel",
                        name: "fixedTel",
                        format: (v, item) => item.fixedTel || item.cellPhone || ''
                    }],
                    items: []
                };
                update();
            }
        };
    });

})();
