angular.module('directive-static-href', []).directive('staticHref', function($timeout,$log) {
    return {
        restrict: "A",
        scope:false,
        link: function(scope, element, attrs) {
            element.click(() => {
                $timeout(() => {
                    var url = attrs.staticHref;
                    if (url.toString().charAt(0) !== '/') url = '/' + url;
                    $log.debug('static-href href to ',url);
                    window.location.href = url;;
                });
            });
            $log.debug('static-href linked!');
        }
    }
});
