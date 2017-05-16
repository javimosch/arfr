angular.module('shopmycourse.controllers')

/**
 * @name ProfileSignInCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Page de connexion
 */

.controller('ProfileSignInCtrl', function($scope, $modal, $rootScope, $state, toastr, Authentication, Validation, CurrentUser, UserAPI, LoadingModal, $log, CustomModal) {
  var self = $scope;
  window.s = $scope;

  var LOADING_TEXT = 'Nous vérifions vos identifiants...';
  var EXTERNAL_POPUP_URL = '/templates/Profile/ExternalServicesPopup.html';
  var MESSAGE_LOADING_SENDING_PASSWORD = 'Envoi du mot de passe...';
  var TEXT_PASWORD_RECOVERING_TITLE = 'Mot de passe oublié';
  var TEXT_PASWORD_RECOVERING_WARN_INVALID_EMAIL = 'Veuillez rentrer une adresse email valide';
  var TEXT_PASWORD_RECOVERING_WARN_EMAIL_NOT_REGISTERED = 'Cettre adresse email n\'est pas enregistrée';
  var TEXT_PASWORD_RECOVERING_INFO_PASSWORD_SENDED = 'Votre mot de passe a été envoyé par email';
  var LEMONWAY_CGU_URL = 'https://www.lemonway.fr/legal/conditions-generales-d-utilisation';

  /**
   * Initialisation de la validation du formulaire
   */
  $scope.validation = Validation;

  /**
   * Initialisation du formulaire
   */
  $scope.isSignin = true;
  $scope.init = function() {
    $scope.user = {
      email: '',
      password: ''
    };
  };
  $scope.init();

  /**
   * @name $scope.signIn
   * @description Lancement de la connexion
   */
  $scope.signIn = function() {

    LoadingModal.show(LOADING_TEXT);

    $log.debug('Signin: Authentication.login', $scope.user)

    Authentication.login($scope.user, function(correct, errorMessage) {

      $log.debug('Signin: Authentication.login.callback')

      LoadingModal.hide();

      if (correct) {

        $log.debug('Signin: route to tabs.home')

        $state.go('tabs.home');
        if ($scope.user.email) {
          toastr.info('Welcome ' + $scope.user.email + '!', 'Authentification');
        }
        $scope.init();
      }
      else {
        toastr.warning(errorMessage, 'Authentification');
        console.error('SignIn error : ' + errorMessage);
      }
    });
  };


  

  /**
   * @name $scope.signInWithEmail
   * @description Connexion classique avec email et mot de passe
   */
  $scope.signInWithEmail = function() {
    $scope.user.auth_method = 'email';
    $scope.signIn();
  };

  /**
   * @name $scope.signInWithFacebook
   * @description Connexion avec Facebook (Firebase)
   */
  $scope.signInWithFacebook = function(validate) {

    if (!validate) {
      return socialSignInModal.show({
        title: 'Connexion avec Facebook'
      }).then(function(result) {
        $log.debug('SignIn: $modal.resolve ' + result);
        if (!result) return;
        $scope.signInWithFacebook(true);
      });
    }

    if (window.firebase.auth().currentUser) return window.firebase.auth().signOut().then(function() {
      $scope.signInWithFacebook(true);
    });

    $log.debug('SignIn: social auth facebook on-the-way');
    var provider = new window.firebase.auth.FacebookAuthProvider();
    window.firebase.auth().signInWithPopup(provider).then(function(result) {
      var token = result.credential.accessToken;
      var user = result.user;
      $log.debug('SignIn: social auth facebook success');
      $scope.user.auth_token = token;
      $scope.user.auth_method = 'facebook';
      $scope.signIn();
    }).catch(catchSocialSignInError('Facebook'));
  };

  function catchSocialSignInError(providerName) {
    return function(error) {
      $log.warn('SignIn: catchSocialSignInError');
      var errorCode = error.code; // Handle Errors here.
      if (errorCode == 'auth/account-exists-with-different-credential') {

        window.firebase.auth().fetchProvidersForEmail(error.email).then(function(providers) {
          
          if(providers[0].toString().indexOf('google')!==-1){
            //return $scope.signInWithGoogle(true);
          }
          
          toastr.info(error.email + ' is registered with a different provider (' + providers[0] + ').', 'Connexion');
        });

        return;
      }
      var errorMessage = error.message;
      var email = error.email; // The email of the user's account used.
      var credential = error.credential; // The firebase.auth.AuthCredential type that was used.
      $log.error(errorCode, errorMessage, email, credential);
      toastr.error('Une erreur est survenue lors de la connexion via ' + providerName, 'Connexion');
    }
  }



  /**
   * @name $scope.signInWithGoogle
   * @description Connexion avec Google (Firebase)
   */
  $scope.signInWithGoogle = function(validate) {


    if (!validate) {
      return socialSignInModal.show({
        title: 'Connexion avec Google'
      }).then(function(result) {
        $log.debug('SignIn: $modal.resolve ' + result);
        if (!result) return;
        $scope.signInWithGoogle(true);
      });
    }

    if (window.firebase.auth().currentUser) return window.firebase.auth().signOut().then(function() {
      $scope.signInWithGoogle(true);
    });


    var provider = new window.firebase.auth.GoogleAuthProvider();
    window.firebase.auth().signInWithPopup(provider).then(function(result) {
      $log.info('SignIn: social auth google success idToken?', result.credential.idToken != undefined);
      $scope.user.id_token = result.credential.idToken || 'invalid';
      $scope.user.auth_method = 'google';
      $scope.signIn();
    }).catch(catchSocialSignInError('Google'));
  };



  /**
   * @name $scope.forgotPassword
   * @description Ouverture de la popup pour mot de passe oublié
   */
  $scope.forgotPassword = function() {
    if (!$scope.user.email || $scope.user.email.length <= 0) {
      toastr.warning(TEXT_PASWORD_RECOVERING_WARN_INVALID_EMAIL, TEXT_PASWORD_RECOVERING_TITLE);
      return;
    }
    LoadingModal.show(MESSAGE_LOADING_SENDING_PASSWORD);
    UserAPI.forgotPassword({
      user: {
        email: $scope.user.email
      }
    }, function(data) {
      toastr.info(TEXT_PASWORD_RECOVERING_INFO_PASSWORD_SENDED, TEXT_PASWORD_RECOVERING_TITLE);
      LoadingModal.hide();
    }, function(err) {
      toastr.warning(TEXT_PASWORD_RECOVERING_WARN_EMAIL_NOT_REGISTERED, TEXT_PASWORD_RECOVERING_TITLE);
      LoadingModal.hide();
    });
  };

 


  $scope.openCGU = function() {
    console.log('openCGU');
    //$scope.modal.show();
    CGUModal.$promise.then(CGUModal.show);
  };
  $scope.openLemonWayCGU = function() {
    console.log('openLemonWayCGU');
    window.open(LEMONWAY_CGU_URL, '_system', 'location=yes');
    return false;
  };
  
  /**
   * Social sign in popup
   **/
  var socialSignInModal = CustomModal(EXTERNAL_POPUP_URL, {
    isSignin: $scope.isSignin || false,
    openCGU:$scope.openCGU,
    openLemonWayCGU:$scope.openLemonWayCGU,
    ok: function() {
      $log.debug('SignIn: $modal.scope.ok');

      this.resolveModal(true);
    },
    close: function() {
      $log.debug('SignIn: $modal.scope.close');
      this.resolveModal(false);
    }
  });
  
  
   /**
   * Social sign in popup (CGU)
   **/
  var CGUModal = $modal({
    scope: $scope,
    templateUrl: '/templates/CGU.html',
    show: false,
    onHide: function(a, b, c) {

    }
  });

  $log.debug('SignInCtrl');

});
