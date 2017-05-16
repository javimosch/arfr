angular.module('shopmycourse.controllers')

/**
 * @name DeliveriesConfirmCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Confirmation de la livraison
*/

.controller('DeliveriesConfirmCtrl', function($scope, $state, $ionicViewSwitcher, $ionicHistory, CurrentDelivery) {

  /**
   * @name $scope.endDeliveries
   * @description Confirmation de la livraison
  */
  $scope.endDeliveries = function () {
    //$ionicViewSwitcher.nextDirection('back');
    $ionicHistory.nextViewOptions({
      disableAnimate: false,
      disableBack: true
    });
    CurrentDelivery.clear(function() {
      $state.go('tabs.home');
    });
  };

})
