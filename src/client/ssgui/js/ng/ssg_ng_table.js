/*global angular*/
/*global _*/
/*global SS*/
(() => {
    angular.module('ssg_ng_table', [])
        .directive('ssgTable', function(
            $rootScope, $routeParams, $timeout, $compile, $uibModal, $templateRequest, $sce, server, $mongoosePaginate) {
            return {
                restrict: 'AE',
                replace: true,
                scope: {},
                template: '<out><div data-dynamic-table model="model"></div></out>',
                link: function(s, elem, attrs) {},
                controller: function($scope, $element, $attrs, $transclude) {

                    console.log('ssg ng table', $attrs.name);

                    var r = $rootScope,
                        db = server,
                        s = $scope,
                        dbPaginate = $mongoosePaginate.get($attrs.name);
                    s.title = "";
                    r.routeParams({
                        prevRoute: $attrs.name.toLowerCase() + 's'
                    });


                    var columns = [
                        /*{
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
                    }
                    */
                    ];


                    //{code:"gacmobile",config:{assetsURL:""}}

                    var Collection = (action, data) => db.ctrl($attrs.name, action, data);

                    Collection('getPaths').then(res => {
                        console.log('getPaths', res);

                        if (res.ok && res.result) {
                            var field = null;
                            Object.keys(res.result).forEach(key => {
                                field = res.result[key];
                                if (field.path == '__v') return;
                                columns.push({
                                    label: field.path,
                                    name: field.path,
                                    disabled: false,
                                    format: (v, item) => {
                                        if(v && v.length>80)
                                            v = v.substring(0,80);
                                        return v;
                                    }
                                });
                            })

                        }

                    });



                    // console.log('$routeParams', $routeParams, r.params);


                    function update(items, cb) {
                        var data = {
                            //__select: "_client _diag address start end price status created createdAt",
                            __populate: {
                                //'_owner': 'email fullName',
                                // '_diag': 'email'
                            },
                            __rules: {
                                //status: {
                                  //  $in: ['created']
                                //},
                                //_owner: {
                                //    $ne: [r.session()._id]
                                //}
                            },
                            __sort: "-createdAt",

                        };



                        console.info('ssg_ng_table payload', data);

                        dbPaginate.ctrl(data, s.model).then(res => {
                            if (cb) {
                                cb(res.result);
                            }
                            else {
                                s.model.update(res.result, null);
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
                            r.route($attrs.name.toLowerCase() + '/' + item._id);
                        },
                        buttons: [{
                            label: "Refresh",
                            type: () => "btn diags-btn bg-azure-radiance margin-left-0 margin-right-1",
                            click: () => update()
                        }, {
                            label: "New",
                            show: false,
                            type: () => "btn diags-btn bg-azure-radiance margin-right-1",
                            click: () => r.route('orders/edit/-1')
                        }],
                        columns: columns,
                        items: [],
                        records: {
                            label: "Records",
                            show: true
                        }
                    };

                }
            };
        });
})();