angular.module('shopmycourse.services')

/**
 * @name Promise
 * @function Service
 * @memberOf shopmycourse.services
 * @description Promise helper
 */

.factory('Promise', function($q) {
    var local = {};
    var self = function(name) {
        if(local[name]!=undefined) return local[name];
        var deferred = $q.defer()
        var promise = deferred.promise;
        promise.resolve = function(rta){
            deferred.resolve(rta);
        }
        local[name] = promise;
        return promise;
    };
    self.resolve = function(name,payload){
        if(!local[name]) return console.warn('DEBUG: Promise resolve. A promise with name',name,'was not found.');
        local[name].resolve(payload);
    }
    return self;
});
