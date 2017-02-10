angular.module('shopmycourse.services')

/**
 * @name LoadingLayer
 * @function Service
 * @memberOf shopmycourse.services
 * @description
 */

.service('LoadingLayer', function($log, DomRefresher) {
    var id = '#loadingLayer';

    function toggle(val) {
        DomRefresher(function() {
            if(!val){
                return $(id).fadeOut(1000); 
            }else{
                $(id).toggle(val);    
            }
            
        });
    }
    return {
        toggle: toggle
    };
});
