angular.module('shopmycourse.services')

/**
 * @name API
 * @function Service
 * @memberOf shopmycourse.services
 * @description Gestion de la communication avec le serveur
*/

.service('API', function ($resource) {
    return function (url, paramDefaults, actions, options) {
        return $resource(url, paramDefaults, actions, options);
    };
});
