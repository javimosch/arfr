/*global angular*/
angular.module('directive-dynamic-table', []).directive('dynamicTable', function(
    $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            model: "=model"
        },
        templateUrl: '/includes/dynamic-table.html',
        link: function(s, elem, attrs) {
            var r = $rootScope;

            console.log('ATTR', attrs.dynamicTable);

            //
            $rootScope.$watch('hasMouse', (v) => {
                s.hasMouse = v;
            });
            //

            var n = attrs.name;
            if (!s.model) {
                console.error('directive.table: no model present');
                return
            }
            s.click = (item, index) => {
                if (s.model.click) {
                    s.model.click(item, index);
                }
            };
            s.buttons = s.model.buttons || null;
            s.columns = s.model.columns || [];
            s.model.items = s.model.items || [];

            s.paginationTotalItems = 1;

            function objUpdate(obj1, obj2, preserveFields) {
                var rta = obj1;
                Object.keys(obj2).forEach(k => {
                    for (var x in preserveFields) {
                        if (preserveFields[x] == k && typeof obj1[k] !== 'undefined') return; //skips fields who need to be preserved. (only when they exists on obj1).
                    }
                    rta[k] = obj2[k];
                })
                return rta;
            }

            var paginationDefaults = {
                currentPage: 1,
                maxSize: 5,
                itemsPerPage: 10,
                total: 1,
                changed: () => {
                    if (s.model.paginate) s.model.paginate(items => {
                        s.model.items = items;
                        $timeout(() => {
                            $rootScope.$apply();
                        });
                    });
                },
                update: (p) => {
                    //s.model.pagination.itemsPerPage=p.itemsLength;
                    //s.paginationTotalItems = s.model.pagination.itemsPerPage * p.numPages;
                    s.model.pagination.total = p.total;
                }
            };
            s.model.pagination = s.model.pagination && objUpdate(s.model.pagination, paginationDefaults, ['itemsPerPage']) || paginationDefaults;

            s.model.update = (items, data) => {
                s.model.items = items;
                s.model.itemsOriginalRef = items;
                if (!s.data) {
                    s.data = data;
                }
            };

            s.model.columnFilter = function(item) {
                return item.disabled == undefined || !item.disabled == true;
            };

            if (s.model.init) {
                s.model.init();
            }
            s.model.itemsOriginalRef = s.model.items;
            window._table = s;
        }
    };
});
