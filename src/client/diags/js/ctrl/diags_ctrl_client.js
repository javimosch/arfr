/*global angular*/
/*global moment*/
/*global $D*/
/*global $U*/
(function() {
    //
    var app = angular.module('app.client', []);



    app.directive('clientOrders', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, server, $mongoosePaginate) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                //model: "=model"
            },
            templateUrl: 'views/directives/directive.fast-crud.html',
            link: function(s, elem, attrs) {
                var r = $rootScope,
                    dbPaginate = $mongoosePaginate.get('Order');
                var ws = server;
                var n = attrs.name;
                s.title = "Your Orders";

                function update(items, cb) {
                    var data = {
                        __select: "address status start end createdAt",
                        __populate: {
                            '_client': 'email userType',
                            '_diag': 'email userType firstName lastName'
                        },
                        __sort: {
                            createdAt: -1
                        }
                    };

                    if (r.userIs(['diag'])) {
                        data['_diag'] = r.session()._id;
                    }
                    if (r.userIs(['client'])) {
                        data['_client'] = r.session()._id;
                    }

/*
                    //STATUS FILTER
                    if ($U.val(s, 'model.filter.fields')) {
                        var status = s.model.filter.fields.status;
                        if (status) {
                            status = status.replaceAll(' ', '');
                            if (status.charAt(status.length - 1) == ',') {
                                status = status.substring(0, status.length - 1);
                            }
                            var statusArr = status.split(',');
                            data.__rules = data.__rules || {};
                            data.__rules.status = {
                                $in: statusArr
                            };
                            //console.log('filter-applied',statusArr);
                        }
                    }*/

                    dbPaginate.ctrl(data, s.model).then(res => {
                        if (res.ok) {
                            res.result.forEach((v) => {
                                v.date = moment(v.start).format('dddd, DD MMMM')
                                v.start = moment(v.start).format('HH:mm');
                                v.end = moment(v.end).format('HH:mm');
                            });
                        }
                        if (cb) {
                            cb(res.result);
                        }
                        else {
                            s.model.update(res.result, null);
                        }
                    });
                    /*
                                        ws.ctrl('Order', 'getAll', data).then((res) => {
                                            if (res.ok) {
                                                res.result.forEach((v) => {
                                                    v.date = moment(v.start).format('dddd, DD MMMM')
                                                    v.start = moment(v.start).format('HH:mm');
                                                    v.end = moment(v.end).format('HH:mm');
                                                });
                                                s.model.update(res.result);
                                            }
                                        });*/
                }

                function payOrder(order) {
                    var modal = this;

                    $D.openStripeModalPayOrder(order, (token) => {
                        order.stripeToken = token.id;
                        ws.ctrl('Order', 'pay', order).then((data) => {
                            if (data.ok) {
                                modal.closeSilent();
                                update();
                                setTimeout(update, 10000);
                                setTimeout(update, 20000);
                                console.info('PAY-OK', data.result);
                                r.message('Your order was paid successfully', 'success', undefined, undefined, {
                                    duration: 20000
                                });
                            }
                            else {
                                r.message('There was a server error, try later.', 'warning', undefined, undefined, {
                                    duration: 20000
                                });
                                console.info('PAY-FAIL', data.err);
                            }
                            modal.closeSilent();
                        });
                    });
                }
                s.model = {
                    pagination: {
                        itemsPerPage: 5
                    },
                    paginate: (cb) => {
                        update(null, cb)
                    },
                   /* filter: {
                        template: 'ordersFilterClient',
                        rules: {
                            status: 'contains'
                        }
                    },*/
                    click: (item, index) => {
                        var data = {};
                        ws.localData().then(function(d) {
                            Object.assign(data, d);
                        });

                        r.params = {
                            item: item,
                            prevRoute: 'dashboard'
                        };
                        r.route('orders/edit/' + item._id);

                    },
                    buttons: [{
                        label: "Refresh",
                        type: () => "btn diags-btn bg-madison spacing-h-1",
                        click: () => update()
                    }],
                    columns: [{
                        label: "Address",
                        name: 'address'
                    }, {
                        label: "Status",
                        name: 'status'
                    }, {
                        label: "Start",
                        name: "start"
                    }, {
                        label: "End",
                        name: "end"
                    }, {
                        label: 'Created',
                        name: 'createdAt',
                        format: function(v, item) {
                            return r.momentDateTime(item.createdAt);
                        }
                    }],
                    items: []
                };
                update();
                //                console.log('directive.exceptions.linked');
            }
        };
    });

    //
    app.directive('clientsList', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, server, $mongoosePaginate) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {},
            templateUrl: 'views/directives/directive.fast-crud.html',
            link: function(s, elem, attrs) {},
            controller: function($scope, $element, $attrs, $transclude) {
                var r = $rootScope,
                    db = server,
                    s = $scope,
                    dbPaginate = $mongoosePaginate.get('User');
                s.title = "";
                r.routeParams({
                    prevRoute: 'clients'
                });

                function update(cb) {
                    dbPaginate.ctrl({
                        userType: 'client'
                    }, s.model).then((res) => {
                        if (cb) {
                            cb(res.result);
                        }
                        else {
                            s.model.update(res.result)
                        }
                    });
                }
                s.model = {
                    init: () => update(),
                    filter: {
                        template: 'clientFilter',
                        rules: {
                            email: 'contains',
                            clientType: 'contains'
                        }
                    },
                    paginate: (cb) => {
                        update(cb)
                    },
                    click: (item, index) => {
                        r.routeParams({
                            item: item,
                        });
                        r.route('clients/edit/' + item._id);
                    },
                    buttons: [{
                        label: "Refresh",
                        type: () => "btn diags-btn bg-azure-radiance margin-left-0 margin-right-1",
                        click: () => update()
                    }, {
                        label: "New Client",
                        type: () => "btn diags-btn bg-azure-radiance",
                        click: () => r.route('clients/edit/-1')
                    }],
                    columns: [{
                        label: "Type",
                        name: 'clientType'
                    }, {
                        label:"Description",
                        name:"firstName",
                        format:(x,o)=>o.firstName+((o.lastName)?', '+o.lastName:'')
                    },{
                        label: "Email",
                        name: 'email'
                    }, {
                        label: "Tel",
                        name: "fixedTel",
                        format: (v, item) => item.fixedTel || item.cellPhone || ''
                    }, {
                        label: "Siret",
                        name: "siret"
                    }],
                    items: []
                };

            }
        };
    });

    //
})();
