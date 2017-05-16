var app = angular.module('app.client.payments', []);


app.directive('clientPayments', function(
    $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, server) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            //model: "=model"
        },
        templateUrl: 'views/directives/directive.fast-crud.html',
        link: function(s, elem, attrs) {
            var r = $rootScope;
            var ws = server;
            var n = attrs.name;
            s.title = 'My Payments';

            function update() {
                var data = {
                    __populate: {
                        '_client': 'email userType',
                        '_diag': 'email userType'
                    }
                };

                if (r.userIs(['diag'])) {
                    data['_diag'] = r.session()._id;
                }
                if (r.userIs(['client'])) {
                    data['_client'] = r.session()._id;
                }

                ws.ctrl('Order', 'getAll', data).then((res) => {
                    if (res.ok) {
                        res.result.forEach((v) => {
                            v.date = moment(v.start).format('DD-MM-YY')
                            v.start = moment(v.start).format('HH:mm');
                            v.end = moment(v.end).format('HH:mm');
                            v.description = v.address + '<br>' + v.date + '<br>' + v.start + ' - ' + v.end;
                            v.status = 'Not yett';
                        });
                        s.model.update(res.result);
                    }
                });
            }


            function pay(order) {
                var handler = StripeCheckout.configure({
                    key: 'pk_test_MDkxtBLcBpHwMCgkqX2dJHjO',
                    image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
                    locale: 'auto',
                    token: function(token) {
                        //id email created
                        //console.info('TOKEN', token);

                        order.stripeToken = token.id;
                        ws.ctrl('Order', 'pay', order).then((data) => {
                            if (data.ok) {
                                console.info('PAY-OK', data.result);
                            } else {
                                console.info('PAY-FAIL', data.err);
                            }
                        });

                    }
                });


                // Open Checkout with further options
                handler.open({
                    name: r.config.companyName || "[r.config.companyName]",
                    description: 'Order payment',
                    email: order._client.email,
                    currency: "eur",
                    amount: order.price * 100,
                    //billingAddress:true,
                    zipCode: false,
                    allowRememberMe: false
                });

            }

            s.model = {
                click: (item, index) => {
                    var data = {};
                    ws.localData().then(function(d) {
                        Object.assign(data, d);
                    });
                    s.open({
                        title: 'Order Payment',
                        data: data,
                        evts: {
                            init: []
                        },
                        item: item,
                        templateUrl: 'views/partials/partial.modal.order.payment.html',
                        callback: (item) => {
                            pay(item);
                            return;
                            ws.ctrl('Order', 'createUpdate', item).then((result) => {
                                update();
                            });
                        }
                    });
                },
                buttons: [{
                    label: "Refresh",
                    type: () => "btn btn-primary spacing-h-1",
                    click: () => update()
                }],
                columns: [{
                    label: "Description",
                    name: 'description'
                }, {
                    label: "You pay",
                    name: 'status'
                }],
                items: []
            };
            update();
        }
    };
});
