angular.module('shopmycourse.services')

/**
 * @name Authentication
 * @function Service
 * @memberOf shopmycourse.services
 * @description Gestion de l'authentification
*/

.service('Authentication', function (DataStorage, $state, $rootScope, UserAPI, toastr, CurrentUser) {
  return {
    /**
     * @name login
     * @description Connexion d'un utilisateur
    */
    login: function (user, next) {
      UserAPI.login({email: user.email, password: user.password, auth_token: user.auth_token, auth_method: user.auth_method, id_token: user.id_token}, function (data) {
        CurrentUser.set(data.user, function () {
          CurrentUser.setToken(data.token, function () {
            return next(true);
          });
        });
      }, function(error) {
        next(false, "Problème d'authentification, vérifiez votre email et votre mot de passe.");
        });
    },
    /**
     * @name signup
     * @description Inscription d'un utilisateur
    */
    signup: function (user, next) {
      UserAPI.create(user, function (data) {
        CurrentUser.set(data.user, function () {
            CurrentUser.setToken(data.token, function () {
              return next(true);
            });
        });
      }, function(error) {
        if (error.data.errors) {
          if (error.data.errors.email) {
            return next(false, "Cet email est déjà utilisé sur Shop My Course");
          }
          else if (error.data.errors.phone) {
            return next(false, error.data.errors.phone[0]);
          }
        } else if (error.data.error_message) {
          return next(false, error.data.error_message);
        }
        return next(false, "Une erreur inconnue est survenue lors de votre inscription");
      });
    },
    /**
     * @name logout
     * @description Déconnexion d'un utilisateur
    */
    logout: function (next) {
      CurrentUser.set(null, function () {
        DataStorage.clear().then(function () {
          return next();
        });
      });
    }
  };
});
