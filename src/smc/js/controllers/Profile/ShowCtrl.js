angular.module('shopmycourse.controllers')

/**
 * @name ProfileShowCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Page des paramètres
 */

.controller('ProfileShowCtrl', function(DomRefresher, $log, $scope, $state, Authentication, CurrentUser, CurrentAddress, UserAPI, LoadingModal, $modal, $rootScope, CustomModal, toastr) {

  var CONFIRM_POPUP_URL = '/templates/Confirm.html';

  window.s = $scope;
  $scope.self = $scope;

  $scope.addressData = {}; //adddress, zip, city

  DomRefresher(function() {
    $scope.addressData = CurrentAddress.get();
  })

  /**
   * Initialisation de la valeur du portefeuille à 0
   */
  $scope.walletValue = 0;

  /**
   * Affichage du message de chargement pour récupérer le profil
   */
  LoadingModal.show('Nous récupérons votre profil...');

  var confirmModal = CustomModal(CONFIRM_POPUP_URL, {
    title: 'Masquer son numéro de téléphone',
    body: 'Êtes-vous sûr de vouloir masquer votre numéro de téléphone ?<br>On vous le déconseille afin de pouvoir communiquer plus facilement avec les autres utilisateurs, si un article est manquant par exemple.<br>De plus cela peut détériorer la note laissée par les autres utilisateurs.',
    ok: function() {
      this.resolveModal(true);
    },
    close: function() {

      this.resolveModal(false);
    }
  }, false);

  
  $scope.onAddressChange = function(asd) {
    CurrentAddress.set($scope.addressData);
    //toastr.info("Addres changé to " + $scope.addressData.address, 'Info');
  };

  /**
   * Chargement de l'utilisateur actuel
   */
  $scope.user = {};
  CurrentUser.get(function(user) {
    $scope.user = user;
    $scope.avatarBackground = CurrentUser.getAvatar();
    UserAPI.getWallet({
      idUser: user.id
    }, function(wallet) {
      $scope.walletValue = wallet.value;
    });
    LoadingModal.hide();
  });


  /**
   * @name $scope.togglePhone
   * @description Affichage d'une popup de confirmation quand il y a modification des options de partage du téléphone
   */
  $scope.togglePhone = function() {

    var newValue = !$scope.user.share_phone;

    if (newValue == false) {

      confirmModal.show().then(function(ok) {
        if (ok) onChange();
      });

    }
    else {
      onChange();
    }

    function onChange() {
      LoadingModal.show('Nous sauvegardons vos préférences...');
      $scope.user.share_phone = newValue;
      UserAPI.update($scope.user, function(user) {
        LoadingModal.hide();
        CurrentUser.set(user, function() {});
        $scope.user = user;
      });
    }
  };

  /**
   * Affichage de la popup "Charte de confidentialité"
   */
  var PrivacyModal = $modal({
    scope: $scope,
    templateUrl: '/templates/Privacy.html',
    show: false,
    onHide: function(a, b, c) {

    }
  });

  $scope.openPrivacy = function() {
    PrivacyModal.$promise.then(PrivacyModal.show);
  };


  /**
   * Affichage de la popup "Conditions générales d'utilisation"
   */
  var CGUModal = $modal({
    scope: $scope,
    templateUrl: '/templates/CGU.html',
    show: false,
    onHide: function(a, b, c) {

    }
  });
  $scope.openCGU = function() {
    CGUModal.$promise.then(CGUModal.show);
  };


  /**
   * @name $scope.logout
   * @description Lancement de la déconnexion
   */
  $scope.logout = function() {
    Authentication.logout(function() {
      $state.go('start');
    });
  };

})
