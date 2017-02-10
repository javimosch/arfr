/*global angular*/
/*global _*/
/*global SS*/
(() => {
    angular.module('gab_ng_assignment', [])
        .directive('gabAssignment', function(
            $rootScope, $routeParams, $timeout, $compile, $uibModal, $templateRequest, $sce, server, $mongoosePaginate) {
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

                    // console.log('$routeParams', $routeParams, r.params);

                    var showAssignedOny = r.params.showAssignedOny || false;
                    delete r.params.showAssignedOny;

                    //console.log('showAssignedOny', showAssignedOny);

                    function update(items, cb) {
                        var data = {
                            //__select: "_client _diag address start end price status created createdAt",
                            __populate: {
                                '_owner': 'email fullName',
                                // '_diag': 'email'
                            },
                            __rules: {
                                status: {
                                    $in: ['created']
                                },
                                _owner: {
                                    $ne: [r.session()._id]
                                }
                            },
                            __sort: "-createdAt",

                        };

                        if (showAssignedOny) {
                            data._biker = r.session()._id;
                            data.__rules.status.$in = ['assigned', 'delivered', 'completed', 'canceled'];
                        }

                        //console.info(data);

                        dbPaginate.ctrl(data, s.model).then(res => {
                            if (cb) {
                                cb(res.result);
                            }
                            else {
                                s.model.update(res.result, null);
                            }
                        });

                    }

                    var columns = [{
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
                                default:
                                    return '<out><span class="label label-warning">Uknown</span></out>'
                            }
                        }
                    }, {
                        label: "Who",
                        name: 'from',
                        format: (v, item) => {
                            return item._owner.fullName || item._owner.email.substring(0, item._owner.email.indexOf('@'));
                        }
                    }, {
                        label: "Type",
                        name: "type",
                        format: (v, item) => r.OrderTypeLabel(v)
                    }, {
                        label: "When",
                        name: "start",
                        format: (v, item) => r.momentDateTime(item.start, 'DD-MM-YY')
                    }];
                    if (!showAssignedOny) {
                        columns.push({
                            label: 'You are in',
                            name: 'createdAt',
                            disabled: false,
                            format: (v, item) => {
                                if (_.includes(item.bikersAvailable, r.session()._id)) {
                                    return 'Yes';
                                }
                                else {
                                    return 'No';
                                }
                            }
                        });
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
                        columns: columns,
                        items: [],
                        records: {
                            label: (!showAssignedOny) ? 'Total number of order waiting for assignments' : "Total",
                            show: true
                        }
                    };

                }
            };
        });
})();