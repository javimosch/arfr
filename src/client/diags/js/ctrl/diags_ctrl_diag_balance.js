(() => {
    var app = angular.module('app.diag.balance', []);
    app.directive('diagBalance', function(
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
                s.title = "Balance details";
                window.balance = s;

                function update(recalc) {
                    var data = {
                        _id: r.session()._id,

                    };
                    if (recalc) {
                        data._calculate = true;
                    }
                    data.period = s.model.periodSelected || 'year';
                    
                    ws.ctrl('User', 'balance', data).then((res) => {
                        if (res.ok) {
                            console.info('balance', res.result);
                            s.balance = res.result;
                            s.model.update(res.result.items, s.balance);
                        }
                    });
                }


                s.model = {
                    /*remove: (item, index) => {
                        var rule = {
                            //_user: r.session().id
                            _id:item._id
                        };
                        ws.ctrl('BalanceItem', 'removeAll', rule, (d) => {
                            if (d.ok) {
                                //ws.ctrl('Balance', 'removeAll', rule, () => update(true));
                                update(true);
                            }
                        })
                    },*/
                    periodSelected:'year',
                    periods: createSelect({
                        label: '(Select a period)',
                        model: 'model.periodSelected',
                        scope: s,
                        change: x => {
                            console.info(x);
                            update(true)
                        },
                        items: ['month', 'year']
                    }),
                    buttonsTpl: 'views/diags/backoffice/partials/diag-balance-buttons.html',
                    tfoot: 'views/diags/backoffice/partials/diag-balance-footer.html',
                    click: (item, index) => {
                        var data = {};
                        ws.localData().then(function(d) {
                            Object.assign(data, d);
                        });

                        ws.ctrl('Payment', 'associatedOrder', {
                            source: item.source
                        }).then((data) => {
                            item = Object.assign(data.result);
                            _open();
                        });

                        function _open() {
                            s.open({
                                title: 'Balance Transaction',
                                data: data,
                                evts: {
                                    'init': []
                                },
                                item: item,
                                templateUrl: 'views/diags/backoffice/partials/admin-balance-details.html',
                                callback: (item) => {}
                            });
                        }
                    },
                    buttons: [{
                        label: "Refresh",
                        type: () => "btn btn-primary spacing-h-1",
                        click: () => update(true)
                    }, {
                        label: "Recalc",
                        show: false,
                        type: () => "btn btn-primary spacing-h-1",
                        click: () => update(true)
                    }],
                    columns: [{
                        label: "Description",
                        name: 'description'
                    }, {
                        label: "Amount (eur)",
                        name: 'amount',
                        align: 'right'
                    }],
                    items: []
                };
                update();
                //                console.log('directive.exceptions.linked');
            }
        };
    });
})();
