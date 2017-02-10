angular.module('shopmycourse.services')

/**
 * @name Store
 * @function Service
 * @memberOf shopmycourse.services
 * @description Stockage de diverses données au sein de l'application
 */

.service('Store', function($injector, lodash, Configuration) {

  var defaultOptions = {
    pullRouteName: 'get',
    pullIfNotFound: true
  };

  return function(collectionName, options) {
    var collectionAPI = $injector.get(collectionName + 'API');
    var options = lodash.defaults(options, defaultOptions);

    var _cache = {
      date: new Date(),
      collectionName: collectionName,
      data: []
    };

    function _cleanResponse(r) {
      return JSON.parse(angular.toJson(r));
    }

    // Get the data from the local cache
    function getStoreAction(filter, next) {

      Configuration.ready().then(function() {

        var filteredData = lodash.filter(_cache.data, filter);
        if (filteredData.length === 0 && options.pullIfNotFound) {
          return pullStoreAction(function(err, data) {
            var filteredData = lodash.filter(data, filter);
            return next(err, filteredData);
          })
        }
        else {
          setTimeout(function() {
            if (typeof next === 'function') {
              return next(null, filteredData);
            }
          }, 0);
        }

      });

    }

    // Execute a custom action from the ng-resource object
    function customStoreAction(customMethodName, attributes, next) {

      Configuration.ready().then(function() {

        if (typeof collectionAPI[customMethodName] !== 'function') {
          throw 'Unknown method name';
        }
        collectionAPI[customMethodName](attributes, function(data) {
          if (typeof next === 'function') {
            return next(null, _cleanResponse(data));
          }
        }, function(err) {
          if (typeof next === 'function') {
            return next(err, null);
          }
        });

      })
    }

    // Pull the data from the remote server and store it into the local cache
    function pullStoreAction(next) {

      Configuration.ready().then(function() {

        collectionAPI[options.pullRouteName]({}, function(data) {
          _cache.date = new Date();
          _cache.data = _cleanResponse(data);
          if (typeof next === 'function') {
            return next(null, _cache.data);
          }
        }, function(err) {
          console.error('Store::pull', err);
          if (typeof next === 'function') {
            return next(err, null);
          }
        });

      });

    }

    // Clean the store
    function cleanStoreAction() {
      _cache.data = [];
    }

    return {
      get: getStoreAction,
      _customAction: customStoreAction,
      pull: pullStoreAction,
      clean: cleanStoreAction
    };

  };

});
