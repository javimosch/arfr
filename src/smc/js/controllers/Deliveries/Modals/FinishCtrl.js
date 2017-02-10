angular.module('shopmycourse.controllers')

/**
 * @name DeliveriesFinishCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Finalisation de la livraison
*/

.controller('DeliveriesFinishCtrl', function($scope, $ionicLoading, $ionicSlideBoxDelegate, $ionicHistory ,$ionicPopup, DeliveryAPI, CurrentAvailability) {

	$scope.ratingStar = 0;

	/**
	 * @name $scope.disableSwipe
	 * @description Désactivation du défilement des vues
	*/
  $scope.disableSwipe = function() {
    $ionicSlideBoxDelegate.enableSlide(false);
  };

	/**
	 * @name $scope.nextSlide
	 * @description Défiler vers la prochaine vue
	*/
  $scope.nextSlide = function () {
    $ionicSlideBoxDelegate.next();
  }

	/**
	 * @name $scope.setRatingStar
	 * @description Mise à jour du nombre d'étoiles pour un avis
	*/
  $scope.setRatingStar = function(newRating) {
		$scope.ratingStar = newRating;
  }

	/**
	 * @name finalize
	 * @description Finalisation de la livraison
	*/
  function finalize(delivery, validation_code) {
    $ionicLoading.show({
      template: 'Nous enregistrons votre avis...'
    });
    DeliveryAPI.finalize({'idDelivery': delivery.id, 'validation_code': validation_code, 'rating': $scope.ratingStar}, function() {
      $scope.nextSlide();
			CurrentAvailability.clear();
			$ionicHistory.clearHistory();
      $ionicLoading.hide();
    }, function (err) {
      console.error(err);
      $ionicLoading.hide();
    });
  }

	/**
	 * @name $scope.finalizeDelivery
	 * @description Lancement de la finalisation de la livraison avec vérification de l'avis
	*/
  $scope.finalizeDelivery = function(delivery, validation_code) {
    if (!$scope.ratingStar) {
      var myPopup = $ionicPopup.confirm({
        template: 'Vous n\'avez pas noté le demandeur, êtes-vous sûr ?',
        title: 'Notation du demandeur',
				okText: 'OK',
        cancelText: 'retour'
      });
      myPopup.then(function(res) {
        if (res) {
          finalize(delivery, validation_code);
        }
      });
    } else {
      finalize(delivery, validation_code);
    }
  };

});
