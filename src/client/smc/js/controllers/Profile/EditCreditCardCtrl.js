angular.module('shopmycourse.controllers')

/**
 * @name ProfileEditCreditCardCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Édition de l'adresse dans les paramètres
*/

.controller('ProfileEditCreditCardCtrl', function($scope, $state, $ionicPopup, $stateParams, $ionicLoading, $ionicHistory, $ionicViewSwitcher, Validation, CardAPI, CurrentUser, OrderStore, DeliveryAPI, $ionicModal) {

  /**
   * Initialisation de la validation du formulaire
  */
  $scope.validation = Validation;

  $scope.card = {};
  $scope.expirations = []
  $scope.user = {};

  /**
   * Affichage du message de chargement pour récupérer le profil
  */
  $ionicLoading.show({
    template: 'Nous récupérons votre profil...'
  });

  /**
   * Chargement de l'utilisateur actuel
  */
  CurrentUser.get(function (user) {
    $scope.user = user;
    $ionicLoading.hide();
  });

  /**
   * Génération des dates pour les sélecteurs d'expiration
  */
  var today = moment();
  for (i = 0; i < 10; i++) {
    var date = {
      'year': today.year(),
      'months': []
    }
    for (j = today.month(); j <= 12; j++) {
      date.months.push(j < 10 ? "0" + j : j);
    }
    $scope.expirations.push(date);
    today.month(1);
    today.add(1, 'years');
  };

  /**
   * @name $scope.formatCreditCard
   * @description Formatage du numéro de carte
  */
  $scope.formatCreditCard = function () {
    var value = $scope.card.number;
    var v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    var matches = v.match(/\d{4,16}/g);
    var match = matches && matches[0] || '';
    var parts = [];
    for (i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      $scope.card.number = parts.join(' ');
    }
  };

  /**
   * @name $scope.endEdit
   * @description Enregistrement de la carte de crédit
  */
  $scope.endEdit = function ($event) {
    $event.preventDefault();
    $ionicLoading.show({
      template: 'Nous enregistrons votre moyen de paiement...'
    });

    var card = {
        number: $scope.card.number.replace(/\s+/g, ''),
        type: 0,
        date: $scope.card.month + '/' + $scope.card.year.year,
        cvv: $scope.card.cvv
    }

    CardAPI.update({
        idUser: $scope.user.id,
        card: card
    }, function(wallet) {
        $scope.user.wallet = wallet;
        CurrentUser.set($scope.user, function() {
            if ($state.current.name == 'tabs.orderpayment') {
              OrderStore.get({id: parseInt($stateParams.idOrder)}, function (err, order) {
                $scope.order = order[0];
                total = Math.round(($scope.order.total + $scope.order.commission) * 100) / 100

                $ionicLoading.hide();
                 var confirmPopup = $ionicPopup.confirm({
                   title: 'Paiement',
                   template: 'Votre carte ' + $scope.user.wallet.credit_card_display + ' sera débitée de ' + total + ' €. Vous pouvez modifier ce numéro de carte dans la partie Paramètres de l\'application.',
                   cancelText: 'Retour',
                   okText: 'OK'
                 });

                 confirmPopup.then(function(res) {
                   if(res) {
                     $ionicLoading.show({
                        template: 'Nous envoyons votre commande...'
                      });
                     DeliveryAPI.confirm({
                       'idDelivery': $scope.order.id
                     }, function() {
                       OrderStore.pull(function(orders) {
                         $scope.modalTitle = "<div class=\"mascot\"><img src=\"img/notifs/commande_envoyee.jpg\" alt=\"commande_envoyee\"></div><span class=\"title\">Commande envoyée</span>"
                         $scope.modalMessage = "Votre livreur va recevoir votre liste de courses d'ici quelques minutes."
                         $scope.modalClose = function () {
                           $state.go('tabs.orders');
                           $scope.modal.hide();
                         }

                         $ionicModal.fromTemplateUrl('default-modal.html', {
                           scope: $scope,
                           animation: 'slide-in-up'
                         }).then(function(modal) {
                           $scope.modal = modal;
                           $ionicLoading.hide();
                           $scope.modal.show();
                         });
                      })
                    })
                  }
                })
              })
            } else {
                $ionicLoading.hide();
                $state.go('tabs.profile');
            }

        })
    }, function(err) {
        $ionicLoading.hide();
        console.log(err);
    });
  }
})
