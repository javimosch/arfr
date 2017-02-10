angular.module('shopmycourse.controllers')

/**
 * @name OrdersSendCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Confirmation de la commande envoyée
*/

.controller('OrdersSendCtrl', function($scope, $state, $ionicViewSwitcher, $ionicHistory) {

  /**
   * @name $scope.endOrder
   * @description Confirmation et retour sur la liste des commandes
  */
  $scope.endOrder = function () {
    $ionicHistory.nextViewOptions({
      disableAnimate: false,
      disableBack: true
    });
    $state.go('tabs.orders');
  };

})
