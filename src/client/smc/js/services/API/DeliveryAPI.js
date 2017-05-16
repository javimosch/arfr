angular.module('shopmycourse.services')

/**
 * @name DeliveryAPI
 * @function Service
 * @memberOf shopmycourse.services
 * @description Gestion des commandes avec le serveur
 */

.service('DeliveryAPI', function(API, Configuration, lodash) {
  var self = {};
  Configuration.ready().then(function() {
    var resource = API(Configuration.apiEndpoint + 'deliveries', {
      idDelivery: '@idDelivery'
    }, {
      // Récupération des livraisons
      'deliveries': {
        method: 'GET',
        url: Configuration.apiEndpoint + 'deliveries',
        headers: {
          'Authorization': 'Bearer'
        },
        cache: false,
        isArray: true
      },
      // Récupération des commandes
      'orders': {
        method: 'GET',
        url: Configuration.apiEndpoint + 'orders',
        headers: {
          'Authorization': 'Bearer'
        },
        cache: false,
        isArray: true
      },
      // Création d'une commande
      'create': {
        method: 'POST',
        url: Configuration.apiEndpoint + 'deliveries',
        headers: {
          'Authorization': 'Bearer'
        },
        cache: false
      },
      // Mise à jour d'une commande correspondant à :idDelivery
      'update': {
        method: 'PUT',
        url: Configuration.apiEndpoint + 'deliveries/:idDelivery',
        headers: {
          'Authorization': 'Bearer'
        },
        cache: false
      },
      // Confirmation d'une commande correspondant à :idDelivery
      'confirm': {
        method: 'POST',
        url: Configuration.apiEndpoint + 'deliveries/:idDelivery/confirm',
        headers: {
          'Authorization': 'Bearer'
        },
        cache: false
      },
      // Annulation d'une commande correspondant à :idDelivery
      'cancel': {
        method: 'POST',
        url: Configuration.apiEndpoint + 'deliveries/:idDelivery/cancel',
        headers: {
          'Authorization': 'Bearer'
        },
        cache: false
      },
      // Finalisation d'une commande correspondant à :idDelivery
      'finalize': {
        method: 'POST',
        url: Configuration.apiEndpoint + 'deliveries/:idDelivery/finalize',
        headers: {
          'Authorization': 'Bearer'
        },
        cache: false
      }
    });
    lodash.extend(self, resource);
  });
  return self;
});
