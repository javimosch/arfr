angular.module('shopmycourse.controllers')

/**
 * @name DeliveriesListCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Liste des livraisons
*/

.controller('DeliveriesListCtrl', function($scope, $ionicLoading, $state, DeliveryStore, DeliveryStatus) {

  $scope.deliveries = [];
  $scope.status = 'pending';

  /**
   * Chargement de la liste des livraisons
  */
  $ionicLoading.show({
    template: 'Nous recherchons vos livraisons...'
  });

  /**
   * Chargement des livraisons
  */
  DeliveryStore.pull(function (err, deliveries) {
    $scope.deliveries = deliveries;
    $ionicLoading.hide();
  }, function (err) {
    console.error(err);
    $ionicLoading.hide();
  });

  /**
   * @name $scope.byStatus
   * @description Filtrage des livraisons par status En cours / Archivé
  */
  $scope.byStatus = function (status) {
    var statuses = ['done', 'canceled'];
    if (status === 'pending') {
      statuses = ['pending', 'accepted', 'completed']
    }
    return function (delivery) {
      if (statuses.indexOf(delivery.status) > -1) {
        return true;
      }
      return false
    }
  };

  $scope.deliveryStatus = DeliveryStatus;

})
