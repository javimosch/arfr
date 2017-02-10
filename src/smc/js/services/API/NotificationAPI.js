angular.module('shopmycourse.services')

/**
 * @name NotificationAPI
 * @function Service
 * @memberOf shopmycourse.services
 * @description Gestion des notifications avec le serveur
 */

.service('NotificationAPI', function(API, Configuration, lodash,$log,Promise) {
  var self = {};
  Configuration.ready().then(function() {
    var resource = API(Configuration.apiEndpoint + 'notifications', {
      idNotification: '@idNotification'
    }, {
      // Récupération des notifications
      'get': {
        method: 'GET',
        url: Configuration.apiEndpoint + 'notifications',
        headers: {
          'Authorization': 'Bearer'
        },
        cache: false,
        isArray: true
      },
      // Mise à jour d'une notification correspondant à :idNotification
      'update': {
        method: 'PUT',
        url: Configuration.apiEndpoint + 'notifications/:idNotification',
        headers: {
          'Authorization': 'Bearer'
        },
        cache: false
      }
    });
    lodash.extend(self, resource);
    //$log.debug('DEBUG: NotificationAPI loaded');
    Promise('notificationAPI_awake').resolve(self);
  });
  window.NotificationAPI = self;
  self.awake = Promise('notificationAPI_awake');
  return self;
});
