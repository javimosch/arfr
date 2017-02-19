/*global angular*/
angular.module('directive-i18n-listview', ['directive-dynamic-table'])
    .directive('i18nListview', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, appApiPaginator, $log, appSession, appApi, i18n, appRouter) {
        return {
            restrict: 'AE',
            //replace: true,
            scope: {},
            template: '<div dynamic-table="dynamic-table-minimal" model="model"></div>',
            link: function(s, elem, attrs) {},
            controller: function($scope, $element, $attrs, $transclude) {
                var r = $rootScope,
                    s = $scope,
                    dbPaginate = appApiPaginator.createFor('texts');
                window.lvw_i18n = s;



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
                        //$log.log(res);
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
                        if (!s.$parent.isBasicCrud) return update();
                        if (!s.$parent.isDetailView()) return update();
                        s.$parent.$on('basic-crud-loaded', () => !s.$parent.isDetailView() && update());
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
                        return '/backoffice/i18n' + '/' + item.code;
                    },
                    buttons: [{
                        label: i18n.TEXT_REFRESH,
                        type: () => "btn btn-primary",
                        click: () => update()
                    }, {
                        label: i18n.TEXT_CREATE,
                        type: () => "btn btn-primary",
                        click: () => appRouter.to('/backoffice/i18n' + '/new')
                    }],
                    columns: [{
                        label: "Code",
                        name: 'code',
                        //format: (v, item) => item.email + "("+item.first_name+' '+item.last_name+')'
                    }, {
                        label: "Message",
                        name: 'content',
                        format: (v, item) => {
                            item.message = JSON.stringify(item.content);
                            return item.message.length > 50 ? item.message.substring(0, 50) + '...' : item.message
                        }
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
