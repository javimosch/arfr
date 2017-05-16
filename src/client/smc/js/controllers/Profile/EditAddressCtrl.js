angular.module('shopmycourse.controllers')

/**
 * @name ProfileEditAddressCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Édition de l'adresse dans les paramètres
*/

.controller('ProfileEditAddressCtrl', function($scope, $rootScope, $state, Validation, CardAPI, CurrentAddress) {

  /**
   * @name $scope.endEdit
   * @description Enregistrement de l'adresse modifiée
  */
  $scope.endEdit = function ($event) {
    $event.preventDefault();
    CurrentAddress.set($rootScope.currentAddress);
    $state.go('tabs.profile');
  };

})
