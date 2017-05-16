angular.module('shopmycourse.services')

/**
 * @name DeliveryRequestAPI
 * @function Service
 * @memberOf shopmycourse.services
 * @description Gestion des demandes de livraison avec le serveur
 */

.service('DeliveryRequestAPI', function(API, Configuration, lodash) {
    var self = {};
    Configuration.ready().then(function() {
        var resource = API(Configuration.apiEndpoint + 'delivery_requests', {
            idDeliveryRequest: '@idDeliveryRequest'
        }, {
            // Création d'une demande de livraison
            'create': {
                method: 'POST',
                url: Configuration.apiEndpoint + 'delivery_requests',
                headers: {
                    'Authorization': 'Bearer'
                },
                cache: false
            },
            'saveProducts': {
                method: 'POST',
                url: Configuration.apiEndpoint + 'delivery_requests/saveProducts/:idDeliveryRequest',
                headers: {
                    'Authorization': 'Bearer'
                },
                cache: false
            },

            'fetchProducts': {
                method: 'POST',
                url: Configuration.apiEndpoint + 'delivery_requests/fetchProducts/:idDeliveryRequest',
                headers: {
                    'Authorization': 'Bearer'
                },
                cache: false,
                isArray: true
            },
            'calculateCommission': {
                method: 'POST',
                url: Configuration.apiEndpoint + 'delivery_requests/calculateCommission/',
                headers: {
                    'Authorization': 'Bearer'
                },
                cache: false,
                isArray: false
            },
            // Annulation d'une demande de livraison correspondant à :idDeliveryRequest
            'cancel': {
                method: 'POST',
                url: Configuration.apiEndpoint + 'delivery_requests/:idDeliveryRequest/cancel',
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
