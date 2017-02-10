/*global angular*/
/*global Awesomplete*/
/*global $U*/
angular.module('fs_ng_awesome_complete',[]).
directive('awesomeComplete', function($rootScope, $timeout, $compile) {
    return {
        restrict: 'A',
        scope: {
            list: "@target",
            model: "=model",
            field: "@field"
        },
        link: function(scope, el, attrs) {
            var r = $rootScope;
            r.dom(function() {
                var list = el.parent().get(0).querySelector(scope.list);
                // new Awesomplete(el.get(0), {list: list});
                var o = new Awesomplete(el.get(0), {
                    list: list,
                    filter: function(text, input) {
                        return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
                    },

                    replace: function(text) {
                        var before = this.input.value.match(/^.+,\s*|/)[0];
                        this.input.value = before + text + ", ";
                        r.dom();
                    }

                });
                el.on('awesomplete-selectcomplete', function() {
                    r.dom(function() {
                        $U.setVal(scope.model, scope.field, el.val());
                    });
                });
            });
        }
    };
});