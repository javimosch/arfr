export const userTable = {
    name: "userTable",
    def: ['$timeout', '$log', 'maquetteTable', function($timeout, $log, maquetteTable) {
        return {
            restrict: "A",
            scope: true,
            template: '',
            link: function(scope, element, attr) {
                var items = [];
                for (var x = 1; x <= 100; x++) {
                    items.push({
                        _id: 123 * x,
                        firstName: 'DummyName',
                        lastName: 'LastName',
                        phone: 12312 * x
                    });
                }
                maquetteTable.create(element.get(0), items, {
                    columns: ["firstName", 'phone']
                });
            }
        };
    }]
};
export default function() {
    return ['$scope', '$log', '$db', '$resolver', '$notify', '$timeout', '$location', '$session', function($scope, $log, $db, $resolver, $notify, $timeout, $location, $session) {
        $resolver.expose('s', $scope);




        $scope.refresh = function() {
            $resolver.coWrapExec(function*() {

            }).catch($notify.handleInvalidResponse());
        };
    }];
}
