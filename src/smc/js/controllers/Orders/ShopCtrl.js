angular.module('shopmycourse.controllers')

/**
 * @name OrdersShopCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Sélection du magasin pour une demande de livraison
*/

.controller('OrdersShopCtrl', function($rootScope, $scope, toastr, $state, $ionicModal, $ionicLoading, CurrentDelivery, ShopAPI, DeliveryRequestAPI, $timeout, OrderStore) {

  /**
   * Initialisation de la recherche de magasins
  */
  $scope.shops = [];
  $scope.minimumStar = 0;
  var timer = null;
  var posOptions = {
    timeout: 10000,
    enableHighAccuracy: true
  };

  /**
  * Affichage du premier chargement de la liste des magasins
  */
  $ionicLoading.show({
    template: 'Nous recherchons les magasins correspondants...'
  });

  refreshShopList();

  /**
   * @name refreshShopList
   * @description Rafraichissement de la liste des magasins
  */
  function refreshShopList() {
    $ionicLoading.show({
      template: 'Nous recherchons les magasins correspondants...'
    });
    var currentDelivery = $rootScope.currentDelivery;
    if (timer) {
      $timeout.cancel(timer);
    }
    timer = $timeout(function getProduct() {
      ShopAPI.search({
        // lat: $scope.position.coords.latitude,
        // lon: $scope.position.coords.longitude,
        address: currentDelivery.address_attributes.address + ' ' + currentDelivery.address_attributes.zip + ' ' + currentDelivery.address_attributes.city,
        stars: $scope.minimumStar,
        schedule: $rootScope.currentDelivery.schedule
      }, function(shops) {
        $scope.shops = shops;
        $ionicLoading.hide();
      }, function(err) {
        console.log(err);
      });
    }, 1300);
  };

  /**
   * @name $scope.sendDeliveryRequest
   * @description Enregistrement de la demmande de livraison
  */
  $scope.sendDeliveryRequest = function(shop) {
    var currentDelivery = $rootScope.currentDelivery;
    currentDelivery.buyer_id = $rootScope.currentUser.id;
    currentDelivery.shop_id = shop.id;
    CurrentDelivery.setShop(shop, function () {});

    $ionicLoading.show({
      template: 'Nous créons votre demande...'
    });

    DeliveryRequestAPI.create(currentDelivery, function(data) {
      CurrentDelivery.setDeliveryRequestID(data.id, function () {});
      $ionicLoading.hide();
      OrderStore.pull();

      $scope.modalTitle = "Bravo !"
      $scope.modalMessage = "Votre demande de livraison a été enregistrée. Vous serez notifié dés qu'un livreur correspondra à vos critères."
      $scope.modalImg = "img/notifs/doigts-en-v.png";
      $scope.modalClose = function () {
        $state.go('tabs.home');
        $scope.modal.hide();
      }

      $ionicModal.fromTemplateUrl('default-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }, function(err) {
      $ionicLoading.hide();
      console.error(err);
    })
  };

  /**
   * @name $scope.setMinimumStar
   * @description Mise à jour du filtre "Notation des livreurs" pour la recherche des magasins
  */
  $scope.setMinimumStar = function(newValue) {
    $scope.minimumStar = newValue;
    refreshShopList();
  };

  /**
   * @name $scope.openMap
   * @description Ouverture d'une carte avec la localisation du magasin
  */
  $scope.openMap = function(shop) {
    var address = shop.address;
    var url = '';
    if (ionic.Platform.isIOS()) {
      url = "http://maps.apple.com/maps?q=" + encodeURIComponent(address);
    } else if (ionic.Platform.isAndroid()) {
      url = "geo:?q=" + encodeURIComponent(address);
    } else {
      url = "http://maps.google.com?q=" + encodeURIComponent(address);
    }
    window.open(url, "_system", 'location=no');
  };

})
