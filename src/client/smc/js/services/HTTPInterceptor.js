angular.module('shopmycourse.services')

/**
 * @name HTTPInterceptor
 * @function Service
 * @memberOf shopmycourse.services
 * @description Intercepteur des requêtes HTTP
*/

.factory('HTTPInterceptor', function ($q, $injector, Configuration,$log) {

  var token = 'Fetching...';
  // CurrentUser = $injector.get('CurrentUser');
  // CurrentUser.getToken(function (tokenFromStorage) {
  //   token = tokenFromStorage;
  // });

  return {
    /**
     * @name setToken
     * @description Mise à jour du token d'authentification
    */
    setToken: function (tokenFromStorage) {
      token = tokenFromStorage;
    },
    /**
     * @name request
     * @description Ajout du token d'authentification et du content-type à la requête HTTP
    */
    request: function (config) {
      if (config.headers.Authorization === 'Bearer') {
        config.headers.Authorization = 'Bearer ' + token;
      }
      config.headers.ContentType = 'application/json'
      return config;
    },
    /**
     * @name requestError
     * @description Traitement de la réponse du serveur en cas de requête erronée
    */
    requestError: function (rejection) {
      return $q.reject(rejection);
    },
    /**
     * @name response
     * @description Traitement de la réponse du serveur
    */
    response: function (response) {
      if (response && response.data && response.data.notice) {
        //$injector.get('toastr').success(Configuration.success[response.data.notice]);
      }
      return response;
    },
    /**
     * @name responseError
     * @description Traitement de la réponse du serveur en cas d'erreur
    */
    responseError: function (response) {
      if (response && response.data && response.data.notice) {
        if (Configuration.errors[response.data.notice]) {
          $injector.get('toastr').error(Configuration.errors[response.data.notice]);
        } else {
          $injector.get('toastr').error(response.data.notice || 'Une erreur inconnue est survenue');
          if(response.data.error){
            $log.warn('WARN: ',response.data.error,response.data.code||'(No code)');
          }
        }

      } else {
        switch (response.status) {
          case 401:
            if ($injector.get('$state').current.name !== 'start' && $injector.get('$state').current.name !== 'signin') {
              $injector.get('toastr').error("Un problème d'authentification est survenu, essayez de vous reconnecter");
              $injector.get('$state').go('start');
              $injector.get("Authentication").logout();
              $injector.get("LoadingModal").hide();
            }
          case 403:
            //$injector.get('toastr').error('Un problème d\'authentification est survenu', 'Erreur');
          break;
          default:
            //$injector.get('toastr').error('Une erreur inconnue est survenu. Informez-nous si cela se reproduit.', 'Erreur');
          break;
        }
      }
      //$injector.get("HTTPLoading").hide();
      return $q.reject(response);
    }
  };
});
