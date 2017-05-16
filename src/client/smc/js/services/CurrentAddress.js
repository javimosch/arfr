angular.module('shopmycourse.services')

/**
 * @name CurrentAddress
 * @function Service
 * @memberOf shopmycourse.services
 * @description Stockage de l'adresse actuelle
 */

.service('CurrentAddress', function($rootScope, lodash, DataStorage) {
  var currentAddress = {};

  function init() {
    return DataStorage.get('current_address').then(function(currentAddressFromStorage) {
      currentAddress = currentAddressFromStorage || {};
      $rootScope.currentAddress = currentAddress;
      //console.log($rootScope.currentAddress)
    });
  }
  init();

  var self = {
    /**
     * @name init
     * @description Initialisation de l'adresse dans la mémoire du télephone
     */
    init: init,
    /**
     * @name set
     * @description Mise à jour de l'adresse actuelle dans la mémoire du télephone
     */
    set: function(address) {
      currentAddress = address;
      DataStorage.set('current_address', address);
    },
    /**
     * @name get
     * @description Récupération de l'adresse actuelle dans la mémoire du télephone
     */
    get: function() {
      return currentAddress;
    }
  };
  window.CurrentAddress = self;
  return self;

});
