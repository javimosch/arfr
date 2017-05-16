angular.module('shopmycourse.controllers')

/**
 * @name DeliveriesShopCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Sélection du magasin pour une ou plusieurs propositions de livraison
 */

.controller('DeliveriesShopCtrl', function(DomRefresher, CurrentUser, CurrentAddress, ItemSelector, $scope, $state, LoadingModal, toastr, ShopAPI, CurrentAvailability, $timeout, $log, lodash) {

  /**
   * Initialisation de la recherche de magasins
   */
  window.s = $scope;
  $scope.t = toastr;
  $scope.self = $scope;
  $scope.shops = null; //array of shops from mastercourses
  $scope.data = {}; //Address data (zip, address, city)
  $scope.address = ""; //selected address
  
  var timer = null; //timer to avoid multiple search in the same time.
  
  var posOptions = {
    timeout: 10000,
    enableHighAccuracy: true
  };

  /**
   * @name $scope.setAddressFromProfile
   * @description 
   */
  $scope.setAddressFromProfile = function() {
    DomRefresher(function() {
      var data = CurrentAddress.get();
      $scope.data.address = data && data.address;
      
      if(!data.address){
        toastr.warning('Attention ', 'Vous devez définir votre domicile dans les paramètres.');
      }
      
    });
  };

  /**
   * @name $scope.setAddressFromGeolocation
   * @description 
   */
  $scope.setAddressFromGeolocation = function() {
    if (window.navigator.geolocation) {
      LoadingModal.show('Nous recherchons les magasins à proximité...');
      window.navigator.geolocation.getCurrentPosition(function(position){
        $scope.position = position;
        $scope.addressInput.clear();
        refreshShopList();
      },function(error){
        
        if(error.code === 1){
          toastr.warning('Attention ', 'Pour utiliser la géolocalisation, vous devez utiliser l\'application Web sur https');
        }
        
        $log.warn(error);
        
        LoadingModal.hide();
      });
    }
    else {
      $log.warn("Geolocation is not supported by this browser.");
    }
  }


  /**
   * @name $scope.isSelected
   * @description Is a shop selected
   */
  $scope.isSelected = function(shop) {
    return ItemSelector.isSelected(shop);
  };

  /**
   * @name $scope.hasSelectedShops
   * @description Has a shop selection
   */
  $scope.hasSelectedShops = function() {
    return ItemSelector.size() > 0;
  }

  /**
   * @name $scope.selectionSize
   * @description 
   */
  $scope.selectionSize = function() {
    return ItemSelector.size();
  }

  /**
   * @name $scope.toggleShop
   * @description Toggle shop selection
   */
  $scope.toggleShop = function(shop) {

    if (ItemSelector.size() > 0 && !ItemSelector.isSelected(shop)) return;

    return ItemSelector.toggleSelect(shop);
  }

  
  
  

  /**
   * @name refreshShopList
   * @description Rafraichissement de la liste des magasins
   */
  function refreshShopList() {
    if (timer) {
      $timeout.cancel(timer);
    }
    timer = $timeout(function getProduct() {
      ShopAPI.search({
        lat: ($scope.position ? $scope.position.coords.latitude : undefined),
        lon: ($scope.position ? $scope.position.coords.longitude : undefined),
        stars: $scope.minimumStar,
        address: ($scope.position ? undefined : $scope.address)
      }, function(shops) {
        $scope.shops = shops;
        LoadingModal.hide();
      }, function(err) {
        console.log(err);
      });
    }, 1300);
  };

  /**
   * Récupération des coordonnées GPS du téléphone
   */
  /*
  $cordovaGeolocation
  .getCurrentPosition(posOptions)
  .then(function (position) {
    $scope.position = position;
    refreshShopList();
  }, function(err) {
    $ionicPopup.alert({
     title: 'Attention !',
     template: "Nous n'arrivons pas à vous géolocaliser. Vous pouvez soit activer le GPS, soit renseigner une adresse manuellement"
    });
    LoadingModal.hide();
  });
*/


  /**
   * @name $scope.setShop
   * @description Enregistrement du magasin sélectionné
   */
  $scope.setSelectedShop = function() {

    var shop = ItemSelector.getAll()[0];

    CurrentAvailability.setShop(shop, function() {
      $state.go('tabs.scheduledelivery');
    });
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
    }
    else if (ionic.Platform.isAndroid()) {
      url = "geo:?q=" + encodeURIComponent(address);
    }
    else {
      url = "http://maps.google.com?q=" + encodeURIComponent(address);
    }
    window.open(url, "_system", 'location=no');
  };

  /**
   * @name $scope.search
   * @description Lancement de la recherche de magasin
   */
  $scope.search = function(arg) {
    LoadingModal.show('Nous recherchons les magasins correspondants...');
    $scope.position = undefined;
    $scope.address = $scope.data.address;
    refreshShopList();
  };


  $log.debug('DeliveriesShopCtrl');

});
