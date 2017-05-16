angular.module('shopmycourse.controllers')

/**
 * @name BodyCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description 
 */

.controller('BodyCtrl', function($scope, $state, CurrentUser, CurrentAvailability, CurrentDelivery, DeliveryRequestAPI, moment, lodash, Authentication, toastr, $rootScope) {

   $rootScope.$CurrentUser = CurrentUser;
    
    console.log('BodyCtrl');

});
