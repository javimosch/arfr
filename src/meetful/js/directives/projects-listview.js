/*global angular*/
angular.module('directive_projects_listview', ['directive_dynamic_table'])
    .directive('projectsListview', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, appApiPaginator, $log, appSession, appRouter, appGui) {
        return {
            restrict: 'AE',
            //replace: true,
            scope: {},
            template: '<div dynamic-table="dynamic-table-minimal" model="model"></div>',
            link: function(s, elem, attrs) {},
            controller: function($scope, $element, $attrs, $transclude) {
                var r = $rootScope,
                    s = $scope,
                    dbPaginate = appApiPaginator.createFor('project');
                s.title = "";
                r.routeParams({
                    prevRoute: 'dashboard'
                });

                function update(items, cb) {
                    var data = {
                        //__select: "_client _diag address start end price status created createdAt",
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
                        return 'project-manager/' + item._id;
                    },
                    click: (item, index) => {

                        if (appSession.hasRole('admin')) {
                            return appRouter.to('project-manager/' + item._id);
                        }

                        var pass = window.prompt('Password?');
                        if (item.password != pass) {
                            return appGui.warningMessage('Invalid password');
                        }
                        else {
                            appRouter.to('project-manager/' + item._id);
                        }
                    },
                    buttons: [{
                        label: "Refresh",
                        type: () => "btn btn-primary",
                        click: () => update()
                    }, {
                        label: "Create",
                        type: () => {
                            if (appSession.hasRole('admin')) {
                                return "btn btn-primary";
                            }
                            else {
                                return "hidden"
                            }
                        },
                        click: () => {
                            //appRouter.to('project-manager/' + -1);
                        },
                        href: () => 'project-manager/' + -1
                    }],
                    columns: [{
                        label: "Name",
                        name: 'name',
                        format: (v, item) => item.name
                    }, {
                        label: "Short description",
                        name: 'short_description'
                            //format: (v, item) => item.name
                    }],
                    items: [],
                    records: {
                        label: 'Records',
                        show: false
                    }
                };

            }
        };
    });
