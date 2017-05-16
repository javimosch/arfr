angular.module('shopmycourse.controllers')

/**
 * @name OrdersConfirmCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Confirmation de la commande
*/

.controller('OrdersConfirmCtrl', function($scope, $state, $ionicViewSwitcher, $ionicHistory) {

  /**
   * @name $scope.endOrder
   * @description Confirmation de la commande
  */
  $scope.endOrder = function () {
    //$ionicViewSwitcher.nextDirection('back');
    $ionicHistory.nextViewOptions({
      disableAnimate: false,
      disableBack: true
    });
    $state.go('tabs.home');
  };

})
