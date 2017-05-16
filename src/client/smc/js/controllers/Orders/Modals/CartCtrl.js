angular.module('shopmycourse.controllers')

/**
 * @name OrdersCartCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Édition de la liste des courses
*/

.controller('OrdersCartCtrl', function($rootScope, $ionicPopup, $ionicLoading, $scope, $timeout, $state, $stateParams, OrderStore, $ionicModal, CurrentCart, lodash, $interval) {

  /**
   * Chargement du panier actuel
  */
  $scope.order = {};
  OrderStore.get({id: parseInt($stateParams.idOrder)}, function (err, order) {
    $scope.order = order[0];
    CurrentCart.initFromOrder($scope.order);
  })

  /**
   * @name $scope.saveCart
   * @description Enregistrement de la liste des courses
  */
  $scope.saveCart = function() {
    $ionicLoading.show({
      template: 'Nous enregistrons votre panier...'
    });
    var order = lodash.cloneDeep($scope.order);
    order.delivery_contents = [];
    order.total = 0;
    lodash.each($rootScope.currentCart, function (p) {
      var item = {
        id_product: p.id,
        quantity: p.quantity,
        unit_price: p.price
      };
      order.total += item.quantity + item.unit_price;
      order.delivery_contents.push(item);
    });
    OrderStore.update(order, function (err, order) {
      if (err) {
        $ionicLoading.hide();
        console.debug(err);
        return;
      }
      OrderStore.pull(function (orders) {
        $state.go('tabs.order', {idOrder: parseInt($stateParams.idOrder)});
        $ionicLoading.hide();
        $scope.closeCartModal();
      });
    })
  };

})
