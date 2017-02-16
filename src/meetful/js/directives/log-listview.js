/*global angular*/
angular.module('directive-log-listview', ['directive-dynamic-table'])
    .directive('logListview', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, appApiPaginator, $log, appSession, appApi,i18n) {
        return {
            restrict: 'AE',
            //replace: true,
            scope: {},
            template: '<div dynamic-table="dynamic-table-minimal" model="model"></div>',
            link: function(s, elem, attrs) {},
            controller: function($scope, $element, $attrs, $transclude) {
                var r = $rootScope,
                    s = $scope,
                    dbPaginate = appApiPaginator.createFor('logs');
                
                window._logs = s;



                $log.log('from-current-user', $attrs.fromCurrentUser != undefined);

                function update(items, cb) {
                    var data = {
                        //__select: "name short_description status created_at",
                        //__populate: {
                        //'_client': 'email',
                        //'_diag': 'email'
                        //},
                        __sort: "-created_at",

                    };
                    dbPaginate.ctrl(data, s.model).then(res => {
                        $log.log(res);
                        if (cb) {
                            cb(res.result);
                        }
                        else {
                            s.model.update(res.result, null);
                        }
                    });

                }
                s.model = {
                    init: () => {
                        if (s.$parent._isEdit !== undefined) {
                            if (!s.$parent.isEdit()) {
                                update()
                            }
                        }
                        else {
                            s.$parent.$on('basic-crud-loaded', () => {
                                if (!s.$parent.isEdit()) {
                                    update()
                                }
                            });
                        }
                    },
                    /*
                    filter: {
                        //template: 'ordersFilter',
                        rules: {
                            status: 'contains'
                        }
                    },*/
                    pagination: {
                        itemsPerPage: 5
                    },
                    paginate: (cb) => {
                        update(null, cb)
                    },
                    itemHref: (item) => {
                        return '/backoffice/logs' + '/' + item._id;
                    },
                    buttons: [{
                        label: i18n.TEXT_REFRESH,
                        type: () => "btn btn-primary",
                        click: () => update()
                    }],
                    columns: [{
                        label: "Category",
                        name: 'category',
                        //format: (v, item) => item.email + "("+item.first_name+' '+item.last_name+')'
                    }, {
                        label: "Message",
                        name: 'message',
                        format: (v, item) => {
                            if (typeof item.message == 'object') item.message = JSON.stringify(item.message);
                            return item.message.length > 50 ? item.message.substring(0, 50) + '...' : item.message
                        }
                    }, {
                        label: "Level",
                        name: 'level'
                    }, {
                        label: 'Created',
                        name: 'created_at',
                        format: (v, item) => {
                            return r.momentFormat(item.created_at, 'DD-MM-YY HH:mm');
                        }
                    }],
                    items: [],
                    records: {
                        label: 'Records',
                        show: true
                    }
                };
            }
        };
    });
