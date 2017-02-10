/*global angular*/
/*global $*/
angular.module('directive_bind_html_compile', []).directive("bindHtmlCompile", ["$compile", function(compile) {
    return {
        restrict: "A",
        link: function(s, el, attrs) {
            s.$watch(function() {
                return s.$eval(attrs.bindHtmlCompile)
            }, function(e) {
                el.html(e && e.toString());
                var f = s;
                if (attrs.bindHtmlScope) {
                    f = s.$eval(attrs.bindHtmlScope);
                }
                var compiled = compile(el.contents())(f);
                //console.info(compiled);
                el.html('').append(compiled);

                var first = el.find(':first-child');
                var tag = first && first.get(0) && first.get(0).tagName.toUpperCase() || "NONE";
                if (tag == "SPAN") { //|| tag == "DIV"
                    var other = $(el).find("*").not(":first");
                    first.append(other);
                    el.html(first.html());
                }

                //the follow fix is for avoid double span in dom tree ex: span > span
                var text = '';
                el.children().each(function() {
                    if ($(this).get(0).tagName == 'SPAN') {
                        text += $(this).text();
                    }
                });
                if (text.length > 0) {
                    el.text(text);
                }

                //console.log('FIRST',first.html(),'EL',el.html());

            })
        }
    }
}]).directive('htmlContent', function(
    $rootScope, $timeout, $compile, $uibModal, $templateRequest, $sce) {
    return {
        restrict: 'AE',
        replace: false,
        scope: {
            html: "&html",
        },
        link: function(s, elem, attrs) {
            if (!s.html) return;

            //$rootScope.dom(() => {
                $timeout(function(){
                    elem.html(s.html);
                });
            //});
        }
    };
});
