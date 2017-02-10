angular.module('shopmycourse.directives', [])

.directive('includeReplace', function() {
    return {
        require: 'ngInclude',
        restrict: 'A',
        link: function(scope, el, attrs) {
            el.html(el.children().html()); // My changes in the line
        }
    };
})

.directive('blankDirective', [function() {

}])


.directive('bindHtmlCompile', ['$compile', function($compile) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$watch(function() {
                return scope.$eval(attrs.bindHtmlCompile);
            }, function(value) {
                // In case value is a TrustedValueHolderType, sometimes it
                // needs to be explicitly called into a string in order to
                // get the HTML string.
                element.html(value && value.toString());
                // If scope is provided use it, otherwise use parent scope
                var compileScope = scope;
                if (attrs.bindHtmlScope) {
                    compileScope = scope.$eval(attrs.bindHtmlScope);
                }
                $compile(element.contents())(compileScope);
            });
        }
    };
}]);