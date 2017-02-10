/*global angular*/
/*global StripeCheckout*/
(function() {
    var app = angular.module('srv_stripe', []);
    app.service('stripe', function($rootScope, server) {
        return {
            openPopup: function(data, cb, opt) {
                opt = Object.assign($rootScope.config || {}, opt || {
                    companyName: "Unknown company"
                });
                if (!opt.STPK) return console.warn('stripe STPK required');
                var handler = StripeCheckout.configure({
                    key: opt.STPK,
                    image: opt.image || 'https://stripe.com/img/documentation/checkout/marketplace.png',
                    locale: opt.locale || 'auto',
                    token: function(token) {
                        if (opt.debug) console.info('debug stripe TOKEN', token);
                        cb(token);
                    }
                });


                // Open Checkout with further options
                handler.open({
                    name: opt.companyName,
                    description: data.description || 'Unkown Description',
                    email: opt.email || undefined,
                    currency: "eur",
                    amount: data.amount * 100,
                    billingAddress: opt.billingAddress || false,
                    zipCode: opt.zipCode || false,
                    allowRememberMe: opt.allowRememberMe || false
                });
            }
        };
    });
})();