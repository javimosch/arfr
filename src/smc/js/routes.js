angular.module('shopmycourse.routes', [])

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);


  var resolveConfiguration = function(Configuration) {
    return Configuration.promise;
  }

  var ROOT = window.ROOT ? (window.ROOT || '').slice(1, (window.ROOT || '').length - 1) : '';
  console.log('ROOT', ROOT);

  $stateProvider

    .state('tabs', {
    url: ROOT + '/tabs',
    templateUrl: ROOT + 'templates/TabBar.html',
    abstract: true,
    resolve: {
      currentUser: function(CurrentUser) {
        var promise = CurrentUser.init(function() {});
        return promise;
      },
      currentDelivery: function(CurrentDelivery) {
        var promise = CurrentDelivery.init(function() {});
        return promise;
      },
      apiEndpoint: resolveConfiguration

    }
  })

  .state('tabs.home', {
    url: ROOT + '/home',
    cache: false,
    views: {
      'home-tab': {
        templateUrl: ROOT + 'templates/Home.html',
        controller: 'HomeCtrl',
        resolve: {
          apiEndpoint: resolveConfiguration,
          availabilityApi: function(AvailabilityAPI) {
            return AvailabilityAPI.promise;
          }
        }
      },
      resolve: {
        apiEndpoint: resolveConfiguration
      }
    }
  })

  .state('tabs.deliveries', {
    url: ROOT + '/deliveries',
    cache: false,
    views: {
      'deliveries-tab': {
        templateUrl: ROOT + 'templates/Deliveries/List.html',
        controller: 'DeliveriesListCtrl',
        resolve: {
          apiEndpoint: resolveConfiguration
        }
      }
    }
  })

  .state('tabs.shopdelivery', {
    url: ROOT + '/delivery/create/shop',
    views: {
      'home-tab': {
        templateUrl: ROOT + 'templates/Deliveries/Shop.html',
        controller: 'DeliveriesShopCtrl'
      }
    }
  })

  .state('tabs.scheduledelivery', {
    url: ROOT + '/delivery/create/schedule',
    cache: false,
    views: {
      'home-tab': {
        templateUrl: ROOT + 'templates/Deliveries/Schedule.html',
        controller: 'DeliveriesScheduleCtrl'
      }
    }
  })

  .state('tabs.confirmdelivery', {
    url: ROOT + '/delivery/create/confirm',
    views: {
      'home-tab': {
        templateUrl: ROOT + 'templates/Deliveries/Confirm.html',
        controller: 'DeliveriesConfirmCtrl'
      }
    }
  })

  .state('tabs.delivery', {
    url: ROOT + '/delivery/:idDelivery',
    cache: false,
    views: {
      'deliveries-tab': {
        templateUrl: ROOT + 'templates/Deliveries/Show.html',
        controller: 'DeliveriesShowCtrl'
      }
    }
  })

  .state('tabs.orders', {
    url: ROOT + '/orders',
    cache: false,
    views: {
      'orders-tab': {
        templateUrl: ROOT + 'templates/Orders/List.html',
        controller: 'OrdersListCtrl'
      }
    }
  })

  .state('tabs.order', {
    url: ROOT + '/order/:idOrder',
    cache: false,
    views: {
      'orders-tab': {
        templateUrl: ROOT + 'templates/Orders/Show.html',
        controller: 'OrdersShowCtrl'
      }
    }
  })

  .state('tabs.orderpayment', {
    url: ROOT + '/order/:idOrder/payment',
    cache: false,
    views: {
      'orders-tab': {
        templateUrl: ROOT + 'templates/Profile/EditCreditCard.html',
        controller: 'ProfileEditCreditCardCtrl'
      }
    }
  })


  .state('tabs.sendOrder', {
    url: ROOT + '/order/:idOrder/send',
    views: {
      'orders-tab': {
        templateUrl: ROOT + 'templates/Orders/Send.html',
        controller: 'OrdersSendCtrl'
      }
    }
  })

  .state('tabs.ordercontent', {
    url: ROOT + '/order/:idOrder/content',
    cache: false,
    views: {
      'orders-tab': {
        templateUrl: ROOT + 'templates/Orders/Content.html',
        controller: 'OrdersContentCtrl'
      }
    },
    resolve: {
      currentCart: function(CurrentCart) {
        var promise = CurrentCart.init();
        return promise;
      }
    }
  })

  .state('tabs.profile', {
    url: ROOT + '/profile',
    cache: false,
    views: {
      'profile-tab': {
        templateUrl: ROOT + 'templates/Profile/Show.html',
        controller: 'ProfileShowCtrl'
      }
    }
  })

  .state('tabs.editprofile', {
    url: ROOT + '/profile/edit',
    views: {
      'profile-tab': {
        templateUrl: ROOT + 'templates/Profile/Edit.html',
        controller: 'ProfileEditCtrl'
      }
    }
  })

  .state('tabs.editcreditcard', {
    url: ROOT + '/profile/creditcard/edit',
    views: {
      'profile-tab': {
        templateUrl: ROOT + 'templates/Profile/EditCreditCard.html',
        controller: 'ProfileEditCreditCardCtrl'
      }
    }
  })

  .state('tabs.editaddress', {
    url: ROOT + '/profile/address/edit',
    views: {
      'profile-tab': {
        templateUrl: ROOT + 'templates/Profile/EditAddress.html',
        controller: 'ProfileEditAddressCtrl'
      }
    }
  })

  .state('start', {
    url: '/start',
    templateUrl: 'templates/Start.html',
    controller: 'StartCtrl',
    resolve: {
      CurrentUserLoading: function(CurrentUser) {
        var promise = CurrentUser.init(function() {});
        return promise;
      },
      apiEndpoint: resolveConfiguration
    }
  })




  .state('root', {
    url: ROOT + '/root',
    resolve: {
      root: function() {
        window.location.href = window.location.origin;
      }
    }
  })


  .state('signin', {
    url: ROOT + '/profile/signin',
    templateUrl: ROOT + 'templates/Profile/SignIn.html',
    controller: 'ProfileSignInCtrl',
    resolve: {
      apiEndpoint: resolveConfiguration
    }
  })

  .state('signup', {
    url: ROOT + '/profile/signup',
    templateUrl: ROOT + 'templates/Profile/SignUp.html',
    controller: 'ProfileSignUpCtrl',
    resolve: {
      apiEndpoint: resolveConfiguration
    }
  })

  .state('tabs.scheduleorder', {
    url: ROOT + '/order/create/schedule',
    views: {
      'home-tab': {
        templateUrl: ROOT + 'templates/Orders/Schedule.html',
        controller: 'OrdersScheduleCtrl'
      }
    }
  })
  
   .state('newOrderShop', {
    url: ROOT + '/new-order/shop',
    cache: false,
    templateUrl: ROOT + 'templates/Orders/booking_shop.html'
    //controller: 'OrdersAddressCtrl'
  })

  .state('tabs.addressorder', {
    url: ROOT + '/order/create/address',
    cache: false,
    views: {
      'home-tab': {
        templateUrl: ROOT + 'templates/Orders/Address.html',
        controller: 'OrdersAddressCtrl'
      }
    }
  })

  .state('tabs.shoporder', {
    url: ROOT + '/order/create/shop',
    cache: false,
    views: {
      'home-tab': {
        templateUrl: ROOT + 'templates/Orders/Shop.html',
        controller: 'OrdersShopCtrl'
      }
    }
  })

  .state('tabs.confirmorder', {
    url: ROOT + '/order/create/confirm',
    views: {
      'home-tab': {
        templateUrl: ROOT + 'templates/Orders/Confirm.html',
        controller: 'OrdersConfirmCvtrl'
      }
    }
  })

  $urlRouterProvider.otherwise('/profile/signin')



});
