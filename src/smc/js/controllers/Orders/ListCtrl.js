angular.module('shopmycourse.controllers')

/**
 * @name OrdersListCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Liste des commandes
*/

.controller('OrdersListCtrl', function($scope, $ionicLoading, OrderStore, DeliveryStatus) {

  $scope.orders = [];
  $scope.status = 'pending';

  /**
   * Chargement de la liste des commandes
  */
  $ionicLoading.show({
    template: 'Nous recherchons vos commandes...'
  });

  /**
   * Chargement des commandes
  */
  OrderStore.pull(function (err, orders) {
    $scope.orders = orders;
    $ionicLoading.hide();
  }, function (err) {
    console.error(err);
    $ionicLoading.hide();
  });

  /**
   * @name $scope.byStatus
   * @description Filtrage des commandes par status En cours / Archivé
  */
  $scope.byStatus = function (status) {
    var statuses = ['done', 'canceled'];
    if (status === 'pending') {
      statuses = ['pending', 'accepted', 'completed']
    }
    return function (delivery) {
      if (status === 'pending') {
        if (delivery.rated === false && delivery.status != 'canceled') {
            return true;
        }
        return false;
      } else {
        if (delivery.rated === true || delivery.status === 'canceled') {
          if (statuses.indexOf(delivery.status) > -1) {
            return true;
          }
        }
        return false;
      }
    }
  };

  $scope.deliveryStatus = DeliveryStatus;

})
