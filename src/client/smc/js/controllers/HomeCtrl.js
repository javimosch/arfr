angular.module('shopmycourse.controllers')

/**
 * @name HomeCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Page d'accueil pour les utilisateurs connectés
 */

.controller('HomeCtrl', function($scope, $state,LoadingModal, CurrentUser, CurrentAvailability, CurrentDelivery, DeliveryRequestAPI, moment, lodash, Authentication) {


  $scope.logout = function() {
    Authentication.logout(function() {
      $state.go('start');
    });
  };

  /**
   * Affichage du message de chargement pour récupérer les dernières informations
   */
  LoadingModal.show('Nous recherchons les dernières informations...');
  

  /**
   * Chargement des disponibilités
   */
  $scope.currentAvailability = [];
  CurrentAvailability.load(function(currentAvailability) {
    $scope.currentAvailability = currentAvailability;
    var dates = [];
    for (var i = 0; i < currentAvailability.length; i++) {
      // Today
      if (moment(currentAvailability[i].schedule.date).diff(moment(), 'days', true) >= -1 && moment(currentAvailability[i].schedule.date).diff(moment(), 'days', true) < 0) {
        dates.push('aujourd\'hui entre ' + currentAvailability[i].schedule.schedule.replace(' - ', ' et '));
      }
      else if (moment(currentAvailability[i].schedule.date).diff(moment(), 'days', true) >= 0) {
        dates.push(moment(currentAvailability[i].schedule.date).format('dddd') + ' entre ' + currentAvailability[i].schedule.schedule.replace(' - ', ' et '));
      }
    }
    $scope.date = lodash.uniq(dates).join(', ');
    LoadingModal.hide();
  });

  /**
   * Chargement des demandes de livraison
   */
  $scope.currentDelivery = [];
  CurrentDelivery.get(function(currentDelivery) {
    $scope.currentDelivery = currentDelivery;
    var dates = []
    for (var schedule in currentDelivery.schedule) {
      var hours = currentDelivery.schedule[schedule].toString();
      if (moment(schedule).diff(moment(), 'days', true) >= -1 && moment(schedule).diff(moment(), 'days', true) < 0) {
        dates.push('aujourd\'hui entre ' + hours.replace(' - ', ' et '));
      }
      else if (moment(schedule).diff(moment(), 'days', true) >= 0) {
        dates.push(moment(schedule).format('dddd') + ' entre ' + hours.replace(' - ', ' et '));
      }
    }
    $scope.deliveryDate = lodash.uniq(dates).join(', ');
    //$ionicLoading.hide();
  });

  /**
   * @name $scope.scheduleOrder
   * @description Méthode appelée avant d'accéder au choix des crénaux
   */
  $scope.scheduleOrder = function() {
    CurrentDelivery.clear();
    //$state.go('tabs.scheduleorder');
    $state.go('newOrderShop');
    
  };

  /**
   * @name $scope.cancelDeliveryRequest
   * @description Annulation d'une demande de livraison
   */
  $scope.cancelDeliveryRequest = function(delivery_request_id) {
    var myPopup = $ionicPopup.confirm({
      template: 'Vous êtes sur le point d\'annuler votre demande de livraison, êtes-vous sûr ?',
      title: 'Annuler la demande',
      cancelText: 'retour'
    });

    myPopup.then(function(res) {
      if (res) {
        /*
        $ionicLoading.show({
          template: 'Nous envoyons votre réponse...'
        });
        */
        CurrentDelivery.clear();
        if (delivery_request_id) {
          DeliveryRequestAPI.cancel({
              idDeliveryRequest: delivery_request_id
            },
            function(success) {
              //$ionicLoading.hide();
            },
            function(err) {
              //$ionicLoading.hide();
            });
        }
        $state.go($state.current, {}, {
          reload: true
        });
      }
    });

  };

  /**
   * Protection pour les utilisateurs non connectés
   */
  if (!CurrentUser.isLogged()) {
    $state.go('start');
  }

  /**
   * @name $scope.shopDelivery
   * @description Méthode appelée avant d'accéder au choix des magasins
   */
  $scope.shopDelivery = function() {
    CurrentAvailability.clear();
    $state.go('tabs.shopdelivery');
  };

  /**
   * @name $scope.cancelAvailability
   * @description Annulation d'une disponibilité
   */
  $scope.cancelAvailability = function() {
    function hasCompletedDelivery() {
      var completed = false;
      lodash.each($scope.currentAvailability, function(availability) {
        if (availability.delivery && availability.delivery.status === 'completed') {
          completed = true;
        }
      });

      return completed;
    }


    var confirmPopup =  null; /*$ionicPopup.confirm({
      title: 'Annuler cette disponibilité',
      template: 'Attention, vous êtes tenu de faire les livraisons que vous avez acceptées. Si un cas de force majeure se présente, merci de nous contacter.',
      cancelText: 'Retour',
      okText: 'Annuler la dispo'
    });*/

    confirmPopup.then(function(res) {
      if (!res) {
        return;
      }
  
      $ionicLoading.show({
        template: 'Nous annulons votre disponibilité...'
      });
      CurrentAvailability.cancel(function(err) {
        if (!err) {
          $scope.currentAvailability = [];
        }
        $ionicLoading.hide();
      });
    });
  };

})
