export default function() {
    return [
        '$scope', '$log', '$db', '$resolver', '$notify', '$session', '$location',
        function($scope, $log, $db, $resolver, $notify, $session, $location) {
            $resolver.expose('s', $scope);
            $scope.showAdminOption = () => $session.role === 'admin';
            $scope.name = $session.firstName || $session.email;
            $scope.welcomeMessage = () => "Welcome home " + $scope.name;
            $scope.viewInvoices = $scope.trackProjects = $scope.viewBalance = $scope.trackTasks = () => {
                $notify.set("Work in progress", {
                    type: 'warn'
                });
            };
            $scope.manageUsers = ()=>{
                $location.path('/manage-users');
            };
            $scope.logout = () => {
                $session.logout();
                $location.path('/');
            };
        }
    ];
}
