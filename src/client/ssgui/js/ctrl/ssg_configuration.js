/*global angular*/
(function() {
    var app = angular.module('ssg_configuration', []);
    app.controller('ssg_configuration', ['$rootScope', '$scope', 'server', 'crud', '$routeParams', function(r, s, db, crud, params) {
        crud.create({
            name: 'Configuration',
            routeParams: params,
            scope: s,
            defaults:{
                data:{
                    description:'Enter a description'
                }
            },
            save:{
                after:{
                    goBack:true
                }
            },
            routes: {
                back: r.MODULE.CONFIGURATION
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