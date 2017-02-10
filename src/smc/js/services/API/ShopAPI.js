angular.module('shopmycourse.services')

/**
 * @name ShopAPI
 * @function Service
 * @memberOf shopmycourse.services
 * @description Gestion des magasins avec le serveur
 */

.service('ShopAPI', function(API, Configuration, lodash) {
  var self = {};
  Configuration.ready().then(function() {
    var resource = API(Configuration.apiEndpoint + 'shops', {
      user_id: '@_user_id'
    }, {
      // Recherche d'un magasin
      'search': {
        method: 'GET',
        url: Configuration.apiEndpoint + 'shops',
        headers: {
          'Authorization': 'Bearer'
        },
        cache: false,
        isArray: true
      }
    });
    lodash.extend(self, resource);
  });
  return self;
});
