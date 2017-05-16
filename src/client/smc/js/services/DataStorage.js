angular.module('shopmycourse.services')




/**
 * @name DataStorage
 * @function Service
 * @memberOf shopmycourse.services
 * @description Gestion de la mémoire du téléphone
 */

.factory('DataStorage', function($localForage, Browser) {
  return {
    /**
     * @name set
     * @description Ajout d'un item dans la mémoire du téléphone
     */
    set: function(key, value) {
      return $localForage.setItem(Browser.name + '_' + key, value);
    },
    /**
     * @name get
     * @description Récupération d'un item dans la mémoire du téléphone
     */
    get: function(key) {
      return $localForage.getItem(Browser.name + '_' + key);
    },
    /**
     * @name remove
     * @description Suppression d'un item dans la mémoire du téléphone
     */
    remove: function(key) {
      return $localForage.removeItem(Browser.name + '_' + key);
    },
    /**
     * @name clear
     * @description Suppression des items de la mémoire du téléphone
     */
    clear: function() {
      return $localForage.clear();
    }
  };
});
