angular.module('directive_file-model',[]).directive('fileModel', ['$parse', "$rootScope", function($parse, $rootScope) {
    return {
        restrict: 'A',
        scope: {
            model: "=fileModel",
            overwrite: "=fileModelOverwrite",
            field: "@field"
                //change:'fileModelChange'
        },
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function() {
                scope.$apply(function() {
                    try {
                        scope.model = scope.model || {};
                        if (typeof scope.overwrite !== 'undefined') {
                            scope.overwrite = (scope.overwrite == undefined) ? false : scope.overwrite;
                            scope.overwrite = (typeof scope.overwrite !== 'boolean') ? false : scope.overwrite;
                        }
                        if (scope.overwrite) {
                            scope.model = element[0].files[0];
                        }
                        else {
                            scope.model[scope.field || 'file'] = element[0].files[0];
                        }
                        if (attrs.fileModelChange) {
                            scope.$parent.$eval(attrs.fileModelChange);
                        }

                    }
                    catch (e) {
                        modelSetter(element[0].files[0]);
                    }
                });
            });
        }
    };
}]);