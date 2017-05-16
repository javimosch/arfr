angular.module('shopmycourse.controllers')

/**
 * @name ProfileSignUpCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Page d'inscription
 */

.controller('ProfileSignUpCtrl', function($scope, $rootScope, $state, toastr, Authentication, Validation, CurrentUser, LoadingModal, $log, CustomModal, $modal) {


  window.s = $scope;
  var EXTERNAL_POPUP_URL = '/templates/Profile/ExternalServicesPopup.html';
  var TEXT_SIGNUP_WARN_INVALID_PHONE = 'Votre numéro de téléphone comporte des erreurs';
  var LEMONWAY_CGU_URL = 'https://www.lemonway.fr/legal/conditions-generales-d-utilisation';

  /**
   * Initialisation de la validation du formulaire
   */
  $scope.validation = Validation;

  /**
   * Initialisation du formulaire
   */
  $scope.isSignup = true;


  $scope.user = {
    /*
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    phone: '',
    auth_token: '',
    auth_method: ''
    */

    firstname: 'Javier',
    lastname: 'Arancibia',
    email: 'arancibiajav@gmail.com',
    password: '32165732',
    phone: '0782809054',

  };






  /**
   * @name $scope.signUp
   * @description Lancement de l'inscription
   */
  $scope.signUp = function() {
    LoadingModal.show('Nous créons votre compte...');
    Authentication.signup($scope.user, function(correct, errorMessage) {
      LoadingModal.hide();
      if (correct) {
        console.log('SignUp : Logged');
        $state.go('tabs.home');
        if ($scope.user.email) {
          toastr.success('Welcome ' + $scope.user.email + '!', 'New Account');
        }
      }
      else {
        toastr.warning(errorMessage, 'Authentification');
        console.log('SignUp error : ' + errorMessage);
      }
    });
  };




  /**
   * @name $scope.signUpWithFacebook
   * @description Inscription avec Facebook
   */
  $scope.signUpWithFacebook = function(validate) {
    if (!validate) {
      return socialSignInModal.show({
        title: 'Inscription avec Facebook'
      }).then(function(result) {
        $log.debug('SignUp: $modal.resolve ' + result);
        if (!result) return;
        $scope.signUpWithFacebook(true);
      });
    }
    if (!validateSocialAuthSignUpFields()) return;
    $log.debug('SignUp: social auth facebook on-the-way');
    var provider = new window.firebase.auth.FacebookAuthProvider();
    return window.firebase.auth().signInWithPopup(provider).then(function(result) {
      var token = result.credential.accessToken;
      $scope.user.email = result.user.email;
      $log.debug('SignUp: social auth facebook success');
      $scope.user.auth_token = token;
      $scope.user.auth_method = 'facebook';
      $scope.signUp();
    }).catch(catchSocialSignUpError('Facebook'));

  };

  /**
   * @name $scope.signUpWithGoogle
   * @description Validate SignUp fields for Social Auth
   */
  function validateSocialAuthSignUpFields() {
    if (!$scope.user.phone) {
      toastr.error(TEXT_SIGNUP_WARN_INVALID_PHONE);
      return false;
    }
    return true;
  }


  /**
   * @name $scope.signUpWithGoogle
   * @description Inscription avec Google
   */
  $scope.signUpWithGoogle = function(validate,modalData) {
    if (!validate) {
      return socialSignInModal.show({
        title: 'Inscription avec Google'
      }).then(function(result) {
        $log.debug('SignUp: $modal.resolve ' + result);
        if (!result.phone) return console.warn('DEBUG: social signup phone required');
        $scope.signUpWithGoogle(true,result);
      });
    }
    if (!validateSocialAuthSignUpFields()) return;
    var provider = new window.firebase.auth.GoogleAuthProvider();
    window.firebase.auth().signInWithPopup(provider).then(function(result) {
      $log.info('SignIn: social auth google success idToken?', result.credential.idToken != undefined);
      
      //return console.log('SignIn: Google user',result);
      
      var displayName = result.user.displayName.split(' ');
      var displayFirstName = displayName && displayName[0];
      var displayLastName = displayName && displayName.length>=2 && displayName[1];
      if(displayFirstName) $scope.user.firstname = displayFirstName;
      if(displayLastName) $scope.user.lastname = displayLastName;
      
      $scope.user.email = result.user.email;
      $scope.user.phone = modalData.phone;
      $scope.user.id_token = result.credential.idToken || 'invalid';
      $scope.user.auth_method = 'google';
      $scope.signUp();
    }).catch(catchSocialSignUpError('Google'));
  };


  function catchSocialSignUpError(providerName) {
    return function(error) {
      $log.warn('Up: catchSocialSignInError');
      var errorCode = error.code; // Handle Errors here.
      if (errorCode == 'auth/account-exists-with-different-credential') {
        window.firebase.auth().fetchProvidersForEmail(error.email).then(function(providers) {
          toastr.info(error.email + ' is already registered with a different provider (' + providers[0] + ').', 'Inscription');
        });
        return;
      }
      var errorMessage = error.message;
      var email = error.email; // The email of the user's account used.
      var credential = error.credential; // The firebase.auth.AuthCredential type that was used.
      $log.error(errorCode, errorMessage, email, credential);
      toastr.error('Une erreur est survenue lors de l\'inscription via ' + providerName, 'Inscription');
    }
  }


  /**
   * @name $scope.signUpWithEmail
   * @description Inscription classique avec email et mot de passe
   */
  $scope.signUpWithEmail = function() {
    $scope.user.auth_method = 'email';
    $scope.signUp();
  };


  /**
   * Affichage des popups CGU et CGU Lemonway
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
  $scope.openLemonWayCGU = function() {
    window.open(LEMONWAY_CGU_URL, '_system', 'location=yes');
    return false;
  };
  $scope.closeCGU = function() {
    $scope.modal.hide();
  };


  var socialSignInModal = CustomModal(EXTERNAL_POPUP_URL, {
    isSignup: $scope.isSignup || false,
    openCGU: $scope.openCGU,
    openLemonWayCGU: $scope.openLemonWayCGU,
    user:{
      phone:''
    },
    ok: function() {
      $log.debug('SignIn: $modal.scope.ok');
      this.resolveModal(this.user);
    },
    close: function() {
      $log.debug('SignIn: $modal.scope.close');
      this.resolveModal(false);
    }
  });




})
