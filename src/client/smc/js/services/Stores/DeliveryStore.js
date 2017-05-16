angular.module('shopmycourse.services')

/**
 * @name DeliveryStore
 * @function Service
 * @memberOf shopmycourse.services
 * @description Stockage des livraisons
*/

.service('DeliveryStore', function (Store) {

  var deliveryStore = Store('Delivery', {
    pullRouteName: 'deliveries'
  });

  deliveryStore.mines = function (attributes, next) {
    this._customAction('mines', attributes, next);
  };

  return (deliveryStore);

});
