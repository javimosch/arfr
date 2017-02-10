angular.module('shopmycourse.controllers')

/**
 * @name ProfileEditCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Édition du profil dans les paramètres
 */

.controller('ProfileEditCtrl', function($scope, LoadingModal, $state, Validation, CurrentUser, UserAPI, Camera) {
  //$jrCrop,
  /**
   * Initialisation de la validation du formulaire
   */
  $scope.validation = Validation;

  /**
   * Affichage du message de chargement pour récupérer le profil
   */
  LoadingModal.show('Nous récupérons votre profil...');

  /**
   * Chargement de l'utilisateur actuel
   */
  $scope.user = {};
  CurrentUser.get(function(user) {
    $scope.user = user;
    $scope.avatarBackground = CurrentUser.getAvatar();
    LoadingModal.hide();
  });

  /**
   * @name getPictureFromCamera
   * @description Récupération d'une photo à partir de l'appareil photo / galerie
   */
  var getPictureFromCamera = function(type) {
    Camera.getPicture(type, function(imageData) {
      $jrCrop.crop({
        url: 'data:image/jpeg;base64,' + imageData,
        width: 200,
        height: 200,
        cancelText: 'Annuler',
        chooseText: 'OK'
      }).then(function(image) {
        // Pass the base64 string to avatar.url for displaying in the app
        $scope.avatarBackground = image.toDataURL();
        // Pass the base64 string to the param for rails saving
        $scope.user.avatar = image.toDataURL();
        $scope.$apply();
      }, function() {
        console.log('jrCrop: User canceled or couldn\'t load image.');
      });
    }, function(error) {
      console.log('Camera: ' + error);
    }, {
      correctOrientation: true,
      targetWidth: 200,
      targetHeight: 200
    });
  };

  /**
   * @name $scope.changeAvatar
   * @description Sélection du mode pour modifier l'avatar
   */
  $scope.changeAvatar = function() {
    var photoSheet = $ionicActionSheet.show({
      buttons: [{
        text: 'Prendre une photo'
      }, {
        text: 'Accéder à la galerie'
      }],
      titleText: 'Modifier votre avatar',
      cancelText: 'Annuler',
      cancel: function() {},
      buttonClicked: function(index) {
        getPictureFromCamera(index);
        return true;
      }
    });
  };

  /**
   * @name $scope.endEdit
   * @description Enregistrement du profil
   */
  $scope.endEdit = function() {
    LoadingModal.show('Nous sauvegardons votre profil...');
    UserAPI.update($scope.user, function(user) {
      LoadingModal.hide();

      if (user) {
        $scope.user = user;
        CurrentUser.set(user, function() {
          $state.go('tabs.profile');
        });
      }
      else {
        console.warn('EditCtr Error while saving.');
        $state.go('tabs.profile');
      }

    }, function(err) {
      LoadingModal.hide();
      console.log(err);
    });
  };
})
