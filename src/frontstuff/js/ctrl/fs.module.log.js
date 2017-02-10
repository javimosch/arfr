(function() {
    var app = angular.module('app.log', []);
    app.controller('logEdit', ['$rootScope', '$scope', 'server', 'crud', '$routeParams', function(r, s, db, crud, params) {
        crud.create({
            name: 'Log',
            routeParams: params,
            scope: s,
            defaults:{
                data:{
                    message:'Write your message'
                }
            },
            save:{
                after:{
                    goBack:true
                }
            },
            routes: {
                back: 'logs'
            },
            modals: {
                confirm: 'confirm',
                delete: {
                    description: () => 'Delete item ' + s.item.type + ' ' + r.momentDateTime(s.item.created)
                }
            },
            events:{
                after:{
                    save:[
                        ()=>{
                            //console.log('saved!');
                        }
                    ]
                }
            },
            validate: {
                options: (s) => {
                    return [
                        [s.item.message, '==', false, 'Message required']
                    ];
                }
            }
        }).init();
    }]);
    app.directive('logList', function(
        $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce, server,$mongoosePaginate) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {},
            templateUrl: 'views/directives/directive.fast-crud.html',
            link: function(s, elem, attrs) {},
            controller: function($scope, $element, $attrs, $transclude) {
                var r = $rootScope,
                    db = server,
                    s = $scope, dbPaginate = $mongoosePaginate.get('Log');
                //
                r.secureSection(s);
                var isClientOrDiag = r.userIs(['client', 'diag']);
                if (isClientOrDiag) {
                    return r.handleSecurityRouteViolation();
                }
                //
                s.title = "Logs";
                r.routeParams({
                    item: {
                        userType: 'admin'
                    },
                    prevRoute: 'logs'
                });

                function update(cb) {
                    dbPaginate.ctrl({},s.model).then(res=>{
                        if(cb) return cb(res.result);
                        s.model.update(res.result);
                    });
                }
                s.model = {
                    init:()=>update(),
                    filter:{
                        template:'logFilter',
                        rules:{
                            type:'contains',
                        }
                    },
                    paginate: (cb) => {
                        update(cb)
                    },
                    click: (item, index) => {
                        r.routeParams({
                            item: item,
                        });
                        r.route('logs/edit/' + item._id);
                    },
                    buttons: [{
                        label: "Refresh",
                        type: () => "btn btn-default margin-left-0 margin-right-1",
                        click: () => update()
                    }, {
                        label: "New Log",
                        show:false,
                        type: () => "btn btn-default margin-right-1",
                        click: () => r.route('logs/edit/-1')
                    },{
                        label:"Delete all",
                        type: () => "btn btn-warning",
                        click: () => {
                            s.confirm('Sure?',()=>{
                                db.ctrl('Log','removeAll',{}).then(d=>{
                                    if(d.ok){
                                        r.infoMessage('All records were deleted');
                                        update(null);
                                    }else{
                                        r.warningMessage("Delete all fail, try later.");
                                    }
                                })
                            });
                        }
                    }],
                    columns: [{
                        label: "Type",
                        name: 'type'
                    }, {
                        label: "Message",
                        name: "message",
                        format: (v, item) => item.message && item.message.substring(0, 100) + ' . . .' || 'Empty'
                    }, {
                        label: "Created",
                        format: (v, item) => r.momentFormat(item.created, "DD-MM-YY HH[h]mm")
                    }],
                    items: [],
                    records:{
                        label:'Records',
                        show:true
                    }
                };
                
            }
        };
    });
})();