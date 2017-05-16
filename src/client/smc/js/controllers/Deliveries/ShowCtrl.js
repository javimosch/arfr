angular.module('shopmycourse.controllers')

/**
 * @name DeliveriesShowCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Affichage d'une livraison
*/

.controller('DeliveriesShowCtrl', function($scope, $state, $stateParams, $ionicLoading, $ionicModal, $cordovaSms, DeliveryStore, CurrentUser) {

  $scope.delivery = {};

  /**
   * Affichage du message de chargement de la livraison
  */
  $ionicLoading.show({
    template: 'Nous recherchons votre livraison...'
  });

  /**
   * Chargement de la livraison actuelle
  */
  DeliveryStore.get({id: parseInt($stateParams.idDelivery)}, function (err, delivery) {
    $scope.delivery = delivery[0];
    $scope.avatarBackground = CurrentUser.avatarFromUserAvatar($scope.delivery.buyer.avatar);
    $ionicLoading.hide();
  })

  /**
   * Affichage de la popup de finalisation de livraison
  */
  $ionicModal.fromTemplateUrl('templates/Deliveries/Modals/Finish.html', {
      animation: 'slide-in-up',
      scope: $scope
  }).then(function (modal) {
    $scope.finishDeliveryModal = modal
  });
  $scope.openFinishDeliveryModal = function () {
    $scope.finishDeliveryModal.show();
  };
  $scope.closeFinishDeliveryModal = function () {
    $scope.finishDeliveryModal.hide();
  };
  $scope.goFinishDeliveryModal = function () {
      $scope.finishDeliveryModal.hide();
      $state.go('tabs.home');
  };

  /**
   * @name $scope.goBack
   * @description Retour à la liste des livraisons
  */
  $scope.goBack = function() {
    $state.go('tabs.deliveries');
  };

  /**
   * @name $scope.setChecked
   * @description Système qui permet au livreur de cocher les articles achetés
  */
  $scope.setChecked = function (index) {
      $scope.delivery.delivery_contents[index].checked = !$scope.delivery.delivery_contents[index].checked;
  };

  /**
   * @name $scope.sendSMS
   * @description Contact de l'acheteur par SMS
  */
  $scope.sendSMS = function () {
    var number = $scope.delivery.buyer.phone;
    $cordovaSms.send(number, '', {
      android: {
        intent: 'INTENT'// send SMS with the native android SMS messaging
      }
    }).then(function () {
      console.log('Succesfully send SMS');
    }, function (err) {
      console.log(err);
    });
  };

})
