angular.module('shopmycourse.controllers')

/**
 * @name StartCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Initial Screen Checks if the user is logged and navigate automatically to dashboard if logged.
 */

.controller('StartCtrl', function($scope, $state, CurrentUser, CurrentAvailability, CurrentDelivery, DeliveryRequestAPI, moment, lodash, Authentication, toastr) {

    if (CurrentUser.isLogged()) {
        $state.go('tabs.home');
    }
    
    

    $scope.signInWithFacebook = function() {
        var provider = new window.firebase.auth.FacebookAuthProvider();
        provider.addScope('email');
        window.firebase.auth().signInWithPopup(provider).then(function(result) {
            
            if(!result) return console.warn(result);
            
            console.log(result);
            
            $scope.user = {};
            $scope.user.auth_token = result.credential.accessToken1;
            $scope.user.auth_method = 'facebook';

            Authentication.login($scope.user, function(correct, errorMessage) {
                if (correct) {
                    $scope.init();
                    $state.go('tabs.home');
                    toastr.info('Connected', 'Authentification');
                }
                else {
                    toastr.warning(errorMessage, 'Authentification');
                    console.error('SignIn error : ' + errorMessage);
                }
            });

        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
            console.warn('error', errorCode, errorMessage, email, credential);
        });

        window.firebase.auth().getRedirectResult().then(function(result) {
            console.log(result);
        }, function(error) {
            console.log(error);
        });

    };


});
