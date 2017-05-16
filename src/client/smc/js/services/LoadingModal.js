angular.module('shopmycourse.services')

/**
 * @name LoadingModal
 * @function Service
 * @memberOf shopmycourse.services
 * @description Loading modal for XHR operations.
 */

.factory('LoadingModal', function($window, $log, DomRefresher,$q,CustomModal) {
    
    var modal = CustomModal('static-backdrop.html',{
        message:''
    },{
        id:'static-backdrop',
        animation: '',
        keyboard: false,
        backdrop: 'static',
        html:true,
        placement:'bottom',
        windowTopClass: 'static-backdrop',
    });
    var ok =false;
    
    setTimeout(function(){
        ok = true;
    },500);
    
    function show(text) {
        
        if(!ok) return setTimeout(function(){
            show(text);
        },200);
        
        $log.debug('LoadingModal: Show text ' + text);
        modal.show({
            message:text
        });
    }

    function hide() {
        
         if(!ok) return setTimeout(function(){
            hide();
        },200);
        
        $log.debug('LoadingModal: Hide');
        modal.hide();
    }

    window.LoadingModal = {
        show: show,
        hide: hide
    };
    return window.LoadingModal;
});
