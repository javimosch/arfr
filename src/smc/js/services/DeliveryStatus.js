angular.module('shopmycourse.services')

/**
 * @name DeliveryStatus
 * @function Service
 * @memberOf shopmycourse.services
 * @description Affichage des icônes de commandes/livraisons
*/

.factory('DeliveryStatus', function () {
  return {
    pending: {
      color: "#ffc900", //energized
      icon: "ion-person"
    },
    accepted: {
      color: "#ffc900", //energized
      icon: "icon-smc-cart"
    },
    completed: {
      color: "#ffc900", //energized
      icon: "icon-smc-cart-down"
    },
    done: {
      color: "green",
      icon: "icon-smc-check"
    },
    canceled: {
      color: "red",
      icon: "icon-smc-cart-cancel"
    }
  };
});
