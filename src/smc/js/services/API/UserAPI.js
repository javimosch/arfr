angular.module('shopmycourse.services')

/**
 * @name UserAPI
 * @function Service
 * @memberOf shopmycourse.services
 * @description Gestion de l'utilisateur avec le serveur
 */

.service('UserAPI', function(API, Configuration, $q, lodash) {
    var self = {};
    Configuration.ready().then(function() {
        var resource = API(Configuration.apiEndpoint + 'users', {
            idUser: '@idUser'
        }, {
            // Récupération de la valeur du portefeuille de l'utilisateur correspondant à :idUser
            'getWallet': {
                method: 'GET',
                url: Configuration.apiEndpoint + 'wallets/:idUser/value',
                headers: {
                    'Authorization': 'Bearer'
                },
                cache: false
            },
            // Connexion de l'utilisateur
            'login': {
                method: 'POST',
                url: Configuration.apiEndpoint + 'users/sign_in',
                cache: false
            },
            // Création d'un utilisateur
            'create': {
                method: 'POST',
                cache: false
            },
            // Mise à jour d'un utilisateur correspondant à :idUser
            'update': {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer'
                },
                cache: false
            },
            // Mot de passe oublié pour l'utilisateur
            'forgotPassword': {
                method: 'POST',
                url: Configuration.apiEndpoint + 'users/password',
                cache: false
            }
        });
        lodash.extend(self, resource);
    });
    return self;
});
