angular.module('shopmycourse.controllers')

/**
 * @name OrdersContentCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Édition de la liste de course
*/

.controller('OrdersContentCtrl', function($scope, $stateParams, $ionicModal, $timeout, $ionicLoading, OrderStore, ProductAPI, CurrentCart, $state) {

  $scope.currentCartObject = CurrentCart;
  $scope.order = {};
  $scope.products = [];
  var timer = null;

  /**
   * Affichage du message de chargement pour la liste de course
  */
  $ionicLoading.show({
    template: 'Chargement ...'
  });

  /**
   * Chargement de la liste de course actuelle
  */
  OrderStore.get({id: parseInt($stateParams.idOrder)}, function (err, order) {
    $scope.order = order[0];
    CurrentCart.initFromLocalStorage($scope.order.id);
    $ionicLoading.hide();
  })

  /**
   * Affichage de la popup liste de course
  */
  $ionicModal.fromTemplateUrl('templates/Orders/Modals/Cart.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.cartModal = modal
  });
  $scope.openCartModal = function () {
    $scope.cartModal.show();
  };
  $scope.closeCartModal = function () {
    $scope.cartModal.hide();
  };

  /**
   * @name $scope.search
   * @description Recherche de produits pour les ajouter à la liste de course
  */
  $scope.search = function (query) {
    if (timer) {
      $timeout.cancel(timer);
    }
    timer = $timeout(function getProduct() {
      $ionicLoading.show({
        template: 'Nous recherchons les produits correspondants à votre recherche...'
      });
      ProductAPI.search({q: query, shop_id: $scope.order.shop.id}, function (products) {
        $scope.products = products;
        $ionicLoading.hide();
      });
    }, 700);
  };

  /**
   * @name $scope.goBack
   * @description Retour sur la page de la commande
  */
  $scope.goBack = function() {
    $state.go('tabs.order', {idOrder: $stateParams.idOrder});
  };

  /**
   * Fonctions qui permettent l'ajout/suppression d'un produit à la liste de course
  */
  $scope.addProduct = CurrentCart.addProduct;
  $scope.removeProduct = CurrentCart.removeProduct;

})
