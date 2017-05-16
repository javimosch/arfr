angular.module('shopmycourse.services')

/**
 * @name DomRefresher
 * @function Service
 * @memberOf shopmycourse.services
 * @description Wait until the end of the next tick and refresh the dom. You can specify a callback and timeout for execution.
 */

.factory('DomRefresher', function($rootScope, $timeout) {
    var self = function(cb, timeout) {
        $timeout(function() {
            if (cb) {
                cb();
            }
            $rootScope.$apply();
        }, timeout || 0);
    };
    window.DomRefresher = self;
    return self;
});
