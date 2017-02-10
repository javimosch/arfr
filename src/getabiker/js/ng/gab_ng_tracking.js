/*global angular*/
/*global SS*/
(() => {
    angular.module('gab_ng_tracking', [])
        .directive('gabTracking', function(
            $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, server, $mongoosePaginate) {
            return {
                restrict: 'AE',
                replace: true,
                scope: {},
                //templateUrl: SS.ROOT+'includes/common/gab_table.html',
                template: '<out><div data-dynamic-table model="model"></div></out>',
                link: function(s, elem, attrs) {},
                controller: function($scope, $element, $attrs, $transclude) {
                    var r = $rootScope,
                        db = server,
                        s = $scope,
                        dbPaginate = $mongoosePaginate.get('Order');
                    s.title = "";
                    r.routeParams({
                        prevRoute: 'orders'
                    });

                    function update(items, cb) {
                        var data = {
                            //__select: "_client _diag address start end price status created createdAt",
                            __populate: {
                                '_owner': 'email fullname',
                                // '_diag': 'email'
                            },
                            _owner: r.session()._id,
                            __sort: "-createdAt",

                        };

                        r.dom(_apply);

                        function _apply() {

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

                            dbPaginate.ctrl(data, s.model).then(res => {
                                if (cb) {
                                    cb(res.result);
                                }
                                else {
                                    s.model.update(res.result, null);
                                }
                            });
                        }
                    }
                    s.model = {
                        init: () => update(),
                        filter: {
                            // template: 'ordersFilter',
                            rules: {
                                status: 'contains'
                            }
                        },
                        pagination: {
                            itemsPerPage: 5
                        },
                        paginate: (cb) => {
                            update(null, cb)
                        },
                        click: (item, index) => {
                            r.routeParams({
                                item: item,
                            });
                            r.route('order/' + item._id);
                        },
                        buttons: [{
                            label: "Refresh",
                            type: () => "btn diags-btn bg-azure-radiance margin-left-0 margin-right-1",
                            click: () => update()
                        }, {
                            label: "New Order",
                            show: false,
                            type: () => "btn diags-btn bg-azure-radiance margin-right-1",
                            click: () => r.route('orders/edit/-1')
                        }],
                        columns: [{
                                label: "Status",
                                name: 'from',
                                format: (v, item) => {
                                    switch (item.status) {
                                        case 'created':
                                            return '<out><span class="label label-default">Created</span></out>';
                                        case 'assigned':
                                            return '<out><span class="label label-primary">Assigned</span></out>';
                                        case 'delivered':
                                            return '<out><span class="label label-success">Delivered</span></out>';
                                        case 'completed':
                                            return '<out><span class="label label-success">Completed</span></out>';
                                            case 'canceled':
                                            return '<out><span class="label label-danger">Canceled</span></out>';
                                        default:
                                            return '<out><span class="label label-warning">Uknown</span></out>'
                                    }
                                }
                            }, {
                                label: "Departure",
                                name: 'from',
                                format: (v) => {
                                    if (window.innerWidth < 800) {
                                        return v.substring(0, 30) + ' ...';
                                    }
                                    else {
                                        return v;
                                    }
                                }
                            }, {
                                label: "Arrival",
                                name: "to",
                                format: (v) => {
                                    if (window.innerWidth < 800) {
                                        return v.substring(0, 30) + ' ...';
                                    }
                                    else {
                                        return v;
                                    }
                                }
                            }, {
                                label: "When",
                                name: "start",
                                format: (v, item) => r.momentDateTime(item.when, 'DD-MM-YY')
                            }
                            /*, {
                                                        label: 'Price',
                                                        name: 'price'
                                                    }, {
                                                        label: 'Status',
                                                        name: 'status'
                                                    }*/
                            , {
                                label: 'Created',
                                name: 'createdAt',
                                disabled: true,
                                format: (v, item) => {
                                    return r.momentFormat(item.createdAt, 'DD-MM-YY HH:mm');
                                }
                            }
                        ],
                        items: [],
                        records: {
                            label: 'Records',
                            show: false
                        }
                    };

                }
            };
        });
})();