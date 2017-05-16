angular.module('shopmycourse.controllers')

/**
 * @name OrdersAddressCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Édition de l'adresse de livraison
*/

.controller('OrdersAddressCtrl', function($scope, Validation, $state, CurrentDelivery, CurrentAddress, CurrentUser) {

  /**
   * Initialisation de la validation du formulaire
  */
  $scope.validation = Validation;

  /**
   * Chargement de l'adresse actuelle
  */
  currentAddress = CurrentAddress.get();
  $scope.address = {
    address: currentAddress.address || '',
    city: currentAddress.city || '',
    zip: currentAddress.zip || '',
    additional_address: currentAddress.additional_address || ''
  };

  /**
   * @name $scope.setAddress
   * @description Enregistrement de l'adresse de livraison
  */
  $scope.setAddress = function(address) {
    CurrentAddress.set(address);
    CurrentDelivery.setAddress(address, function(currentDelivery) {
      $state.go('tabs.shoporder');
    });
  };

})
