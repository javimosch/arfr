angular.module('shopmycourse.services')

/**
 * @name CurrentDelivery
 * @function Service
 * @memberOf shopmycourse.services
 * @description Stockage de la demande de livraison actuelle
*/

.service('CurrentDelivery', function ($rootScope, DataStorage) {

    var currentDelivery = {
      schedule: {},
      shop_id: null
    };

    return {
        /**
         * @name init
         * @description Initialisation de la demande de livraison
        */
        init: function (next) {
          return DataStorage.get('current_delivery').then(function (currentDeliveryFromStorage) {
            currentDelivery = currentDeliveryFromStorage || {};
            $rootScope.currentDelivery = currentDelivery;
            next();
          });
        },
        /**
         * @name get
         * @description Récupération de la demande de livraison présente dans la mémoire du téléphone
        */
        get: function (next) {
          return next(currentDelivery);
        },
        /**
         * @name setSchedule
         * @description Ajout du créneau à la demande de livraison
        */
        setSchedule: function (schedule, next) {
          currentDelivery.schedule = schedule;
          return DataStorage.set('current_delivery', currentDelivery).then(function () {
            $rootScope.currentDelivery = currentDelivery;
            return next(currentDelivery);
          });
        },
        /**
         * @name setShop
         * @description Ajout du magasin à la demande de livraison
        */
        setShop: function (shop, next) {
          currentDelivery.shop_id = shop.id;
          currentDelivery.shop_name = shop.name;
          return DataStorage.set('current_delivery', currentDelivery).then(function () {
            $rootScope.currentDelivery = currentDelivery;
            return next(currentDelivery);
          });
        },
        /**
         * @name setAddress
         * @description Ajout de l'adresse à la demande de livraison
        */
        setAddress: function(address, next) {
          currentDelivery.address_attributes = address;
          return DataStorage.set('current_delivery', currentDelivery).then(function () {
            $rootScope.currentDelivery = currentDelivery;
            return next(currentDelivery);
          });
        },
        /**
         * @name setDeliveryRequestID
         * @description Ajout de l'id retourné par le serveur à la demande de livraison
        */
        setDeliveryRequestID: function (delivery_request_id, next) {
          currentDelivery.delivery_request_id = delivery_request_id;
          return DataStorage.set('current_delivery', currentDelivery).then(function () {
            $rootScope.currentDelivery = currentDelivery;
            return next(currentDelivery);
          });
        },
        /**
         * @name clear
         * @description Suppression de la demande de livraison de la mémoire du téléphone
        */
        clear: function (next) {
          DataStorage.remove('current_delivery').then(next);
          currentDelivery = {
            schedule: {},
            shop_id: null
          };
        }
    };

});
