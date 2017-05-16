angular.module('shopmycourse.services')

/**
 * @name ConfigAPI
 * @function Service
 * @memberOf shopmycourse.services
 * @description enviroment variables (for heroku!)
*/

.service('ConfigAPI', function (API) {
    var path = 'files/config.json';
    var resource = API(path, { },
    {
      'fetch': { method: 'GET', url: path, headers: {}, cache: false, isArray: false }
    });

    return resource;
});
