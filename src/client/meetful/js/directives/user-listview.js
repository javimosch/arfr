/*global angular*/
angular.module('directive-user-listview', ['directive-dynamic-table'])
    .directive('userListview', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, appApiPaginator, $log, appSession, appApi, appRouter,i18n) {
        return {
            restrict: 'AE',
            //replace: true,
            scope: {},
            template: '<div dynamic-table="dynamic-table-minimal" model="model"></div>',
            link: function(s, elem, attrs) {},
            controller: function($scope, $element, $attrs, $transclude) {
                var r = $rootScope,
                    s = $scope,
                    dbPaginate = appApiPaginator.createFor('muser');
                s.title = "";
                r.routeParams({
                    prevRoute: 'dashboard'
                });

                window._events = s;

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
                        if (s.$parent._isDetailView !== undefined) {
                            if (!s.$parent.isDetailView()) {
                                update()
                            }
                        }
                        else {
                            s.$parent.$on('basic-crud-loaded', () => {
                                if (!s.$parent.isDetailView()) {
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
                        return '/backoffice/users' + '/' + item._id;
                    },
                    click: (item) => {
                        appRouter.to('/backoffice/users' + '/' + item._id);
                    },
                    buttons: [{
                        label: i18n.TEXT_REFRESH,
                        type: () => "btn btn-primary",
                        click: () => update()
                    }, {
                        label: i18n.TEXT_CREATE || 'i18n.TEXT_CREATE',
                        type: () => "btn btn-primary",
                        click: () => appRouter.to('/backoffice/users/new')
                    }],
                    columns: [{
                        label: "Name",
                        name: 'first_name',
                        format: (v, item) => item.email + "(" + item.first_name + ' ' + item.last_name + ')'
                    }, {
                        label: "Short description",
                        disabled: true,
                        name: 'short_description'
                            //format: (v, item) => item.name
                    }, {
                        label: "Status",
                        disabled: true,
                        name: 'status',
                        format: (v, item) => {
                            switch (v) {
                                case 'open':
                                    return i18n.TEXT_OPEN;
                                case 'closed':
                                    return i18n.TEXT_CLOSED;
                                default:
                                    return "INVALID_STATUS";
                            }
                        }
                    }, {
                        label: 'Created',
                        name: 'created_at',
                        format: (v, item) => {
                            return r.momentFormat(item.created_at, 'DD-MM-YY HH:mm');
                        }
                    }, {
                        label: "Delete",
                        disabled: true,
                        name: 'status',
                        show: (item) => item.status == 'closed',
                        format: (v, item) => "<i ng-click='deleteItem(item)'>X</i>"
                    }],
                    items: [],
                    records: {
                        label: 'Records',
                        show: false
                    }
                };

                if (appSession.hasRole('admin')) {
                    s.model.remove = (item, index) => {
                        window.event.preventDefault();
                        if (confirm('Sure?')) {
                            appApi.delete('muser', item._id).then(update());
                        }
                    };
                }

            }
        };
    });
