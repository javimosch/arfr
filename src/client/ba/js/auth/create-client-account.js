import store2 from 'store2';
const storePrefix = 'ba_';
const store = store2.namespace(storePrefix);

export default function() {
    return ['$scope', '$log', '$db', '$resolver', '$notify', function($scope, $log, $db, $resolver, $notify) {
        $scope.email = store('email', '');
        $scope.pwd = store('pwd', '');
        $scope.submit = function() {
            $resolver.coWrapExec(function*() {
                var data = yield $db.auth.createAccount({
                    email: $scope.email,
                    role: "client",
                    pwd: $scope.pwd
                });
                $notify.set("Execelent! Now you can <a href='/clients'>Sign-in</a>.");
            }).catch($notify.handleInvalidResponse());
        }
    }];
}
