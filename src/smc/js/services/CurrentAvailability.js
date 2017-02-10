angular.module('shopmycourse.services')

/**
 * @name CurrentAddress
 * @function Service
 * @memberOf shopmycourse.services
 * @description Stockage des disponibilités actuelles
 */

.service('CurrentAvailability', function($rootScope, AvailabilityAPI, DataStorage, Promise, CurrentUser) {

  var currentAvailability = {
    schedules: [],
    shop_id: null,
    deliveryman_id: $rootScope.currentUser && $rootScope.currentUser.id
  };

  DataStorage.get('current_availability').then(function(local) {
    currentAvailability = local;

    CurrentUser.awake.then(function(user) {
      currentAvailability.deliveryman_id = user.id;
      Promise('currentAvailability_awake').resolve(currentAvailability);
    });


  });


  var self = {
    awake: Promise('currentAvailability_awake'),
    /**
     * @name load
     * @description Récupération des disponibilités présentes sur le serveur
     */
    load: function(next) {
      return AvailabilityAPI.get({}, function(currentAvailabilityFromServer) {
        if(currentAvailabilityFromServer){
          currentAvailabilityFromServer = currentAvailabilityFromServer.map(function(availability){
            return availability.toJSON();
          });
        }
        currentAvailability = currentAvailabilityFromServer || {};
        $rootScope.currentAvailability = currentAvailability;
        DataStorage.set('current_availability', currentAvailabilityFromServer);
        return next(currentAvailability);
      });
    },
    /**
     * @name get
     * @description Récupération des disponibilités présentes dans la mémoire du téléphone
     */
    get: function(next) {
      return next && next(currentAvailability) || currentAvailability;
    },
    /**
     * @name setSchedules
     * @description Ajout des créneaux aux disponibilités
     */
    setSchedules: function(schedules, next) {
      if (currentAvailability.constructor === Array) {
        currentAvailability = {
          schedules: [],
          shop_id: null,
          deliveryman_id: $rootScope.currentUser.id
        };
      }
      currentAvailability.schedules = schedules;
      return DataStorage.set('current_availability', currentAvailability).then(function() {
        $rootScope.currentAvailability = currentAvailability;
        return next(currentAvailability);
      });
    },
    /**
     * @name setShop
     * @description Ajout du magasin aux disponibilités
     */
    setShop: function(shop, next) {
      if (currentAvailability.constructor === Array) {
        currentAvailability = {
          schedules: [],
          shop_id: null,
          deliveryman_id: $rootScope.currentUser.id
        };
      }
      currentAvailability.shop = shop.toJSON();
      currentAvailability.shop_id = shop.id;
      return DataStorage.set('current_availability', currentAvailability).then(function() {
        $rootScope.currentAvailability = currentAvailability;
        console.log($rootScope.currentAvailability)
        return next(currentAvailability);
      });
    },
    /**
     * @name clear
     * @description Suppression des disponibilités de la mémoire du téléphone
     */
    clear: function(next) {
      currentAvailability = {
        schedules: [],
        shop_id: null,
        deliveryman_id: $rootScope.currentUser.id
      };
      $rootScope.currentAvailability = currentAvailability;
      DataStorage.remove('current_availability').then(next);
    },
    /**
     * @name cancel
     * @description Annulation des disponibilités
     */
    cancel: function(next) {
      async.each(currentAvailability, function(availability, next) {
        AvailabilityAPI.cancel({
          idAvailability: availability.id
        }, function(a, b) {
          return next();
        }, function(err) {
          return next(err);
        })
      }, next)
    }
  };
  window.CurrentAvailability = self;
  return self;

});
