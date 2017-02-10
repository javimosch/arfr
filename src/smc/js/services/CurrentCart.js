angular.module('shopmycourse.services')

/**
 * @name CurrentCart
 * @function Service
 * @memberOf shopmycourse.services
 * @description Stockage du panier
*/

.service('CurrentCart', function ($rootScope, lodash, DataStorage) {
    var currentCart = {};
    /*
    {
      12: {
        name: 'Produit'
        quantity: 3,
        image_url: 'http://...',
        package_content: 'Paquet de 10',
        price: 2.36
      },
      [...]
    }
    */
    function init () {
      return DataStorage.get('current_cart').then(function (currentCartFromStorage) {
        currentCart = currentCartFromStorage || {};
        $rootScope.currentCart = currentCart;
      });
    }
    init();

    return {
        /**
         * @name init
         * @description Initialisation du panier actuel
        */
        init: init,
        /**
         * @name init
         * @description Initialisation du panier pour une commande donnée
        */
        initFromLocalStorage: function(orderId) {
          return DataStorage.get('current_cart_' + orderId).then(function (currentCartFromStorage) {
            currentCart = currentCartFromStorage || {};
            $rootScope.currentCart = currentCart;
            $rootScope.currentCartId = orderId;
            console.log($rootScope.currentCartId)
          });
        },
        /**
         * @name initFromOrder
         * @description Chargement d'une commande dans le panier
        */
        initFromOrder: function (order) {
          currentCart = {};
          lodash.each(order.delivery_contents, function (p) {
            var item = {
              id: p.product.id,
              name: p.product.name,
              quantity: p.quantity,
              image_url: p.product.image_url,
              package_content: p.product.package_content,
              price: p.product.price
            };
            currentCart[p.product.id] = item;
          });
          $rootScope.currentCart = currentCart;
          $rootScope.currentCartId = order.id;
          return currentCart;
        },
        /**
         * @name addProduct
         * @description Ajout d'un produit au panier
        */
        addProduct: function (product) {
          var product_id = product.id;
          // Product already there
          if (currentCart[product_id]) {
            currentCart[product_id].quantity++;
          }
          // Product not already there
          else {
            currentCart[product_id] = product;
            currentCart[product_id].quantity = 1;
          }
          $rootScope.currentCart = currentCart;
          DataStorage.set('current_cart_' + $rootScope.currentCartId, currentCart);
        },
        /**
         * @name removeProduct
         * @description Suppression d'un produit au panier
        */
        removeProduct: function (product) {
          var product_id = product.id;
          // Product already there
          if (currentCart[product_id]) {
            currentCart[product_id].quantity--;
            if (currentCart[product_id].quantity <= 0) {
              delete currentCart[product_id];
            }
          }
          $rootScope.currentCart = currentCart;
          DataStorage.set('current_cart_' + $rootScope.currentCartId, currentCart);
        },
        /**
         * @name quantity
         * @description Retourne la quantité des produits présents dans le panier
        */
        quantity: function () {
          console.log(currentCart)
          var q = 0;
          lodash.map(currentCart, function (p) {
            q += p.quantity;
          });
          return q;
        },
        /**
         * @name total
         * @description Retourne le prix total de produits présents dans le panier
        */
        total: function () {
          var t = 0;
          lodash.map(currentCart, function (p) {
            t += p.quantity * p.price;
          });
          return t;
        }
    };
});
