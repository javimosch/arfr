angular.module('shopmycourse.services')

/**
 * @name Validation
 * @function Service
 * @memberOf shopmycourse.services
 * @description Validation des formulaires
*/

.factory('Validation', function ($window) {
  return {
    email: {
      pattern: "[-a-zA-Z0-9~!$%^&*_=+}{\'?]+(\.[-a-zA-Z0-9~!$%^&*_=+}{\'?]+)*@([a-zA-Z0-9_][-a-zA-Z0-9_]*(\.[-a-zA-Z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-zA-Z][a-zA-Z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?",
      message: "Entrez une adresse email valide"
    },
    phone: {
      pattern: "0(6|7)[0-9]{8}",
      message: "Entrez un numéro de mobile valide"
    },
    name: {
      pattern: "[A-zÀ-ÿ\-\ \']{2,}",
      message: "Entrez un nom valide"
    },
    address: {
      pattern: ".{1,}",
      message: "Entrez une adresse valide"
    },
    zipcode: {
      pattern: "[0-9]{5}",
      message: "Entrez un code postal valide"
    },
    city: {
      pattern: ".{1,}",
      message: "Entrez un ville valide"
    },
    code: {
      pattern: "[a-zA-Z0-9]{6}",
      message: "Entrez un code valide"
    },
    password: {
      pattern: ".{8,}",
      message: "Votre mot de passe doit avoir au moins 8 caractères"
    },
    number: {
      pattern: "[0-9]{1,}",
      "message": "Entrez un numéro valide"
    },
    creditcard: {
      pattern: "[0-9]{4} *[0-9]{4} *[0-9]{4} *[0-9]{4}",
      "message": "Entrez un numéro de carte valide"
    },
    cvv: {
      pattern: "[0-9]{3}",
      "message": "Entrez un cvv valide"
    }
  };
});
