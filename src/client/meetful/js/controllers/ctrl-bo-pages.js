/*global angular*/
angular.module('ctrl-bo-pages', ['directive-dynamic-table']).controller('ctrl-bo-pages', ['appApi', '$scope', '$rootScope', '$routeParams', '$log', '$timeout', 'appGui', 'aceEditor', '$routeParams', 'appBasicCrud',
    function(appApi, s, r, params, $log, $timeout, appGui, aceEditor, $routeParams, appBasicCrud) {
        window.s = s;

        /*
        s.item.content = getACEContent(true);
                        s.item.template = window.encodeURIComponent(template);
                        s.setACEContent(window.decodeURIComponent(s.item.content));
                        */

        appBasicCrud({
            collectionName: "pages",
            scope: s,
            $routeParams: $routeParams,
            payloads: {
                get: {
                    //__populate: [{
                    //   path: "_category",
                    //    model: 'categories'
                    //}]
                }
            },
            get: {
                field: '_id'
            },
            actions: {
                save: true
            }
        });

        aceEditor.bind(s, () => {
            //after ace init
        });

    }
])

.directive('pagesListview', function(
    $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, appApiPaginator, $log, appSession, appApi, i18n, appRouter) {
    return {

        restrict: 'AE',
        scope: {},
        template: '<div dynamic-table="dynamic-table-minimal" model="model"></div>',
        link: function(s, elem, attrs) {},
        controller: function($scope, $element, $attrs, $transclude) {
            var r = $rootScope,
                s = $scope,
                dbPaginate = appApiPaginator.createFor('pages');

            function update(items, cb) {
                var data = {
                    __sort: "-createdAt",

                };
                data = Object.assign(data, s.model.filter.payload || {});
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
                init: () => {
                    $log.log('is-lvw-?');
                    r.$on('lvw-update', () => {
                        $log.log('is-lvwl');
                        s.model.filter.firstTime();
                    });
                },
                filter: {
                    template: 'pagesFilter',
                    update: update,
                    rules: {
                        status: 'in'
                    }
                },
                pagination: {
                    itemsPerPage: 10
                },
                paginate: (cb) => {
                    update(null, cb)
                },
                click: (item, index) => {
                    appRouter.params({
                        item: item,
                    });
                    appRouter.to('backoffice/pages/' + item._id);
                },
                buttons: [{
                    label: "Rafraîchir",
                    type: () => "btn btn-primary",
                    click: () => update()
                }, {
                    label: "Créer",
                    type: () => "btn btn-primary",
                    click: () => appRouter.to('backoffice/pages/new')
                }],
                columns: [{
                    label: "Code",
                    name: 'code',
                    //format: (v, item) => item._diag.email
                }, {
                    label: "Description",
                    name: 'description',
                    //format: (v, item) => item._diag.email
                }, {
                    label: "URL",
                    name: 'url',
                    //format: (v, item) => item._diag.email
                }, {
                    label: 'Created',
                    name: 'createdAt',
                    format: (v, item) => {
                        return r.momentFormat(item.createdAt, 'DD-MM-YY HH:mm');
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
