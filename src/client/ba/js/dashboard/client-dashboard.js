export default function() {
    return ['$scope', '$log', '$db', '$resolver', '$notify', '$session', '$location', function($scope, $log, $db, $resolver, $notify, $session, $location) {

        $scope.name = $session.firstName || $session.email;
        $scope.welcomeMessage = () => "Welcome home " + $scope.name;
        $scope.viewInvoices = $scope.trackProjects = $scope.viewBalance = $scope.trackTasks = () => {
            $notify.set("Work in progress", {
                type: 'warn'
            });
        }
        $scope.logout = () => {
            $session.logout();
            $location.path('/');
        };
    }];
}
