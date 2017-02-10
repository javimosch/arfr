/*global angular*/
angular.module('fs_ng_toggle',[])
.directive('toggleClick', function($rootScope, $timeout, $compile) {
    return {
        restrict: 'A',
        link: function(scope, el, attrs) {

            el.on('click', () => {
                var v = typeof attrs.ngValue == 'string' && attrs.ngValue.toLowerCase() == 'true' || attrs.ngValue == true;
                val(v);
            });
            
            //first time
            $rootScope.$emit(attrs.toggleValue + '-changed', val());
            

            function val(value) {
                var ss = scope;
                var split = attrs.toggleValue.split('.');
                var last = split[split.length - 1];
                split.forEach(word => {
                    if (word == last) return;
                    ss = ss[word];
                    if (ss == undefined) {
                        console.warn('toggleValue ', attrs.toggleValue, word + ' is undefined');
                        return 0;
                    }
                });
                if (ss == undefined) return;
                if (value!==undefined) {
                    ss[last] = value;
                    //$rootScope.$emit(attrs.toggleValue + '-changed', value);
                    $timeout($rootScope.$apply());
                }else{
                    return ss[last];
                }
            }
        }
    };
})
.directive('toggleClass', function($rootScope, $timeout, $compile) {
    return {
        restrict: 'A',
        link: function(scope, el, attrs) {
            var val = typeof attrs.ngValue == 'string' && attrs.ngValue.toLowerCase() == 'true' || attrs.ngValue == true;
            if (!attrs.toggleValue) return console.warn('toggle-class: toggle-value attribute required.');
            //
            function update(v) {
                if (v == val) {
                    el.addClass(attrs.toggleClass);
                }
                else {
                    el.removeClass(attrs.toggleClass);
                }
            }
            $rootScope.$on(attrs.toggleValue + '-changed', function(evt, v) {
                //update(v);
            });
            
            scope.$watch(attrs.toggleValue,function(v){
                if(typeof v == 'boolean') update(v);
            })
        }
    };
});