/*global angular*/
(function() {
    var app = angular.module('ssg_device', []);
    app.controller('ssg_device', ['$rootScope', '$scope', 'server', 'crud', '$routeParams', function(r, s, db, crud, params) {
        crud.create({
            name: 'Device',
            routeParams: params,
            scope: s,
            defaults:{
                data:{
                    registrationId:''
                }
            },
            save:{
                after:{
                    goBack:true
                }
            },
            routes: {
                back: r.MODULE.DEVICE
            },
            modals: {
                confirm: 'okModal',
                delete: {
                    description: () => 'Delete item ' + s.item._id + ' ?',
                    data:{
                        cancelLabel:"Cancel",
                        okLabel:"Yes"
                    }
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
                        [s.item.config.assetsURL, '==', false, 'Message required']
                    ];
                }
            }
        }).init();
    }]);
   
})();