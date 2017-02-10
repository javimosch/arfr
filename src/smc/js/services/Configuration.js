angular.module('shopmycourse.services')

/**
 * @name Configuration
 * @function Service
 * @memberOf shopmycourse.services
 * @description Configuration de l'application
 */

.service('Configuration', function($q, lodash,$log) { //ConfigAPI
  var isReady = false;

  var deferred = $q.defer()

  var config = {
    promise: deferred.promise,
    ready: function() {
      return deferred.promise;
    },
    init: function(externalConfig) {
      if (externalConfig.API_ENDPOINT) {
        config.apiEndpoint = externalConfig.API_ENDPOINT;
        console.log('apiEndpoint', config.apiEndpoint);
      }else{
        $log.warn('Debug: Invalid configuration file.');
      }
      if (externalConfig.GOOGLE_API_KEY) {
        config.googleWebClientId = externalConfig.GOOGLE_API_KEY;
        console.log('googleWebClientId', config.googleWebClientId);
      }
      deferred.resolve(true);
    },
    apiEndpoint: 'https://smc-dev-server.herokuapp.com/',
    googleWebClientId: '626641878895-g9cr85f6k0pkmduabpmnago4imn486sh.apps.googleusercontent.com',
    errors: {
      SCHEDULE_ALREADY_EXIST: 'Vous avez déjà déposé une disponibilité',
      VALIDATION_CODE_ERROR: 'Votre code de validation est incorrect',
      LEMONWAY_SERVER_ERROR: 'Une erreur liée à votre paiement est survenue',
      WALLET_ERROR: 'Une erreur liée à votre paiement est survenue',
      VALIDATION_CODE_ERROR: 'Une erreur est survenue lors de la validation',
      EMPTY_CART: 'Vous devez remplir votre panier',
      COMPLETED_DELIVERY: 'Vous avez une livraison en cours, vous ne pouvez pas annuler votre disponibilité'
    },
    success: {
      ORDER_DONE: 'La commande a été effectuée',
      RATING_DONE: 'Votre avis a bien été pris en compte'
    }
  };


  window._Configuration = config;
  return config;
});
