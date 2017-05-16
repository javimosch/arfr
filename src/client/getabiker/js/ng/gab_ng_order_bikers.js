/*global angular*/
/*global SS*/
/*global $U*/
(() => {
    angular.module('gab_ng_order_bikers', [])
        .directive('gabOrderBikers', function(
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
                        dbPaginate = $mongoosePaginate.get('User');
                    s.title = "";
                    $U.expose('lvw', s);
                    // r.routeParams({
                    //    prevRoute: 'orders'
                    // });

                    // console.log('$routeParams', $routeParams);

                    r.routeParams({
                        update: () => {
                            update(null, null);
                        }
                    });

                    function update(items, cb) {
                        if (!r.params || !r.params.bikersAvailable) {
                            console.log('debug waiting for r.params.bikersAvailable');
                            if (cb) {
                                return cb([]);
                            }
                            else {
                                return s.model.update([], null);
                            }
                        }

                        var data = {
                            //__select: "_client _diag address start end price status created createdAt",
                            ///__populate: {
                            //    '_owner': 'email fullname',
                            // '_diag': 'email'
                            //},
                            __rules: {
                                _id: {
                                    $in: r.params.bikersAvailable,
                                }
                            }
                            //__sort: "-createdAt",

                        };
                        dbPaginate.ctrl(data, s.model).then(res => {
                            if (cb) {
                                cb(res.result);
                            }
                            else {
                                s.model.update(res.result, null);
                            }
                        });
                    }

                    function assign(_biker) {
                        if (r.params.assign) {
                            r.params.assign(_biker);
                        }
                    }

                    function assignById(_id) {
                        var _biker = s.model.items.filter(_biker => _biker._id == _id)[0];
                        assign(_biker);
                    }

                    s.model = {
                        select: (item) => {
                            //console.info(item);
                        },
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
                            //r.route('biker/' + item._id);
                            assign(item);
                        },
                        buttons: [{
                            label: "Assign Biker",
                            show: false,
                            type: () => "btn diags-btn bg-azure-radiance margin-left-0 margin-right-1",
                            disabled: () => s.model.itemSelected == undefined || s.model.itemSelected == false,
                            click: () => assign(s.model.itemSelected)
                        }],
                        columns: [{
                            disabled: true,
                            label: "Select",
                            name: 'fullName',
                            format: (v, item) => {
                                return "<out><input type='checkbox' ng-change='model.select(item)' name='lvw-select' ng-model='model.itemSelected' ng-true-value=\"'" + item._id + "'\"></out>";
                            }
                        }, {
                            label: "Who",
                            name: 'fullName'
                        },{
                            label: "His Base Price",
                            name: 'eurxkmbase',
                            format:(v)=>v+' €'
                        }, {
                            label: "Extra per KM",
                            name: "eurxkm",
                            format: (v, item) => v + ' €'
                        }],
                        items: [],
                        records: {
                            label: 'Available Bikers',
                            show: true
                        }
                    };

                }
            };
        });
})();