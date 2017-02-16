/*global angular*/
angular.module('directive-event-listview', ['directive-dynamic-table'])
    .directive('eventListview', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, appApiPaginator, $log, appSession, appApi, i18n, appRouter) {
        return {
            restrict: 'AE',
            //replace: true,
            scope: {},
            template: '<div dynamic-table="dynamic-table-minimal" model="model"></div>',
            link: function(s, elem, attrs) {},
            controller: function($scope, $element, $attrs, $transclude, i18n) {
                var r = $rootScope,
                    s = $scope,
                    dbPaginate = appApiPaginator.createFor('mevent');
                s.title = "";
                appRouter.params({
                    prevRoute: 'dashboard'
                });

                window._events = s;

                //$log.log('from-current-user',$attrs.fromCurrentUser!=undefined);

                function update(items, cb) {
                    var data = {
                        __select: "name short_description status created_at _owner",
                        __populate: [{
                            model: "muser",
                            path: '_owner',
                            select: "email first_name last_name"
                        }],
                        //'_client': 'email',
                        //'_diag': 'email'
                        //},
                        __sort: "-created_at",

                    };

                    if ($attrs.fromCurrentUser != undefined) {
                        data._owner = appSession()._id
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
                    init: () => update(),
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
                        return "/" + i18n.ROUTE_EDIT_EVENT + '/' + item._id;
                    },
                    click: (item) => {
                        appRouter.to("/" + i18n.ROUTE_EDIT_EVENT + '/' + item._id);
                    },
                    buttons: [{
                        label: i18n.TEXT_REFRESH,
                        type: () => "btn btn-primary",
                        click: () => update(),
                        show: () => true
                    }],
                    columns: [{
                        label: i18n.TEXT_LISTVIEW_LABEL_EVENT_NAME,
                        name: 'name',
                        format: (v, item) => item.name
                    }, {
                        label: i18n.TEXT_LISTVIEW_LABEL_EVENT_SHORT_DESCRIPTION,
                        name: 'short_description'
                            //format: (v, item) => item.name
                    }, {
                        label: i18n.TEXT_LISTVIEW_LABEL_CREATOR,
                        name: '_owner',
                        format: (v, item) => {
                            return item._owner && ((item._owner.first_name && item._owner.first_name + ' ' + item._owner.last_name) || item._owner.email);
                        }
                    }, {
                        label: i18n.TEXT_STATUS,
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
                        label: i18n.TEXT_LISTVIEW_LABEL_EVENT_CREATED_AT,
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
                        if (confirm('Sure?')) {
                            appApi.delete('mevent', item._id).then(update());
                        }
                    };
                }

            }
        };
    });
