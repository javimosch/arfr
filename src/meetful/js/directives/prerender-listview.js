/*global angular*/
angular.module('directive-prerender-listview', ['directive_dynamic_table'])
    .directive('prerenderListview', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, appApiPaginator, $log, appSession, appApi,i18n,appSettings,appRouter) {
        return {
            restrict: 'AE',
            scope: {},
            template: '<div dynamic-table="dynamic-table-minimal" model="model"></div>',
            link: function(s, elem, attrs) {},
            controller: function($scope, $element, $attrs, $transclude) {
                var r = $rootScope,
                    s = $scope,
                    dbPaginate = appApiPaginator.createFor('prerender');
                window._logs = s;
                function update(items, cb) {
                    var data = {
                        __select:"appName name createdAt",
                        appName:appSettings.appName,
                        __sort: "-createdAt",

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
                    pagination: {
                        itemsPerPage: 5
                    },
                    paginate: (cb) => {
                        update(null, cb)
                    },
                    itemHref: (item) => {
                        return '/backoffice/prerenders' + '/' + item._id;
                    },
                    click: (item) => {
                        appRouter.to('/backoffice/prerenders' + '/' + item._id);
                    },
                    buttons: [{
                        label: i18n.TEXT_REFRESH,
                        type: () => "btn btn-primary",
                        click: () => update()
                    }],
                    columns: [{
                        label: "Name",
                        name: 'name',
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
