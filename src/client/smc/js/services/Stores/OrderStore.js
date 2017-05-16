angular.module('shopmycourse.services')

/**
 * @name OrderStore
 * @function Service
 * @memberOf shopmycourse.services
 * @description Stockage des demandes de livraison
*/

.service('OrderStore', function (Store) {

  var orderStore = Store('Delivery', {
    pullRouteName: 'orders'
  });

  orderStore.update = function (attributes, next) {
    attributes.idDelivery = attributes.id;
    this._customAction('update', attributes, next);
  };

  return (orderStore);

});
