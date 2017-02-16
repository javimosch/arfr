/*global angular*/
angular.module('directive-tasks-listview', ['directive-dynamic-table'])
    .directive('tasksListview', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, appApiPaginator, $log, appSession, appRouter, appGui) {
        return {
            restrict: 'AE',
            scope: {
                project: "=project"
            },
            template: '<div dynamic-table="dynamic-table-minimal" model="model"></div>',
            link: function(s, elem, attrs) {},
            controller: function($scope, $element, $attrs, $transclude) {
                var r = $rootScope,
                    s = $scope,
                    dbPaginate = appApiPaginator.createFor('task');
                s.title = "";
                
                window._tasks = s;

                var disabled = true;

                s.$watch('project', (project) => {
                    if (project && project._id) {
                        r.routeParams({
                            prevRoute: '/project-manager/' + s.project._id
                        });
                        if(appSession.getCache().tasks!=undefined){
                            s.model.update(appSession.getCache().tasks);
                        }
                        update();
                        disabled = false;
                    }
                });



                function update(items, cb) {
                    var data = {
                        _project: s.project._id,
                        __sort: "-number -created_at"
                    };
                    dbPaginate.ctrl(data, s.model).then(res => {
                        $log.log(res);
                        if (cb) {
                            cb(res.result);
                        }
                        else {
                            s.model.update(res.result, null);
                        }
                        appSession.saveCache('tasks',res.result);
                    });

                }
                s.model = {
                    init: () => {},
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
                        return '/task/' + item._id;
                    },
                    buttons: [{
                        label: "Refresh",
                        type: () => "btn btn-primary",
                        click: () => {
                            if (disabled) return;
                            update();
                        }
                    }, {
                        label: "New task",
                        type: () => {
                            if (appSession.hasRole('admin') && !disabled) {
                                return "btn btn-primary";
                            }
                            else {
                                return "hidden"
                            }
                        },
                        click: () => {
                            //appRouter.to('task/' + -1);
                            appSession.saveMetadata({
                                project: s.project
                            });

                        },
                        href: () => '/task/' + -1
                    }],
                    columns: [{
                        label: "Task #",
                        name: 'number',
                        format: (v, item) => item.number
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
