angular.module('shopmycourse.controllers')

/**
 * @name OrdersFinishCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Finalisation de la commande
*/

.controller('OrdersFinishCtrl', function($scope, $ionicLoading, $ionicSlideBoxDelegate, $ionicPopup, $ionicHistory, DeliveryAPI, CurrentDelivery) {

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
  };

  /**
   * @name finalize
   * @description Finalisation de la commande
  */
	function finalize(order) {
		$ionicLoading.show({
			template: 'Nous enregistrons votre avis...'
		});
		DeliveryAPI.finalize({
			'idDelivery': order.id,
			'rating': $scope.ratingStar
		}, function() {
			$ionicLoading.hide();
      CurrentDelivery.clear();
      $ionicHistory.clearHistory();
			$ionicSlideBoxDelegate.next();
		}, function(err) {
			console.error(err);
			$ionicLoading.hide();
		});
	};

  /**
   * @name $scope.finalizeDelivery
   * @description Lancement de la finalisation de la commande avec vérification de l'avis
  */
  $scope.finalizeDelivery = function(order) {
		if (!$scope.ratingStar) {
			var myPopup = $ionicPopup.confirm({
				template: 'Vous n\'avez pas noté le livreur, êtes-vous sûr ?',
				title: 'Notation du livreur',
        okText: 'OK',
				cancelText: 'retour'
			});
			myPopup.then(function(res) {
				if (res) {
					finalize(order);
				}
			});
		} else {
			finalize(order);
		}
  };

  /**
   * @name $scope.setRatingStar
   * @description Mise à jour du nombre d'étoiles pour un avis
  */
  $scope.setRatingStar = function(newRating) {
		if(!$scope.order.buyer_rating) {
			$scope.ratingStar = newRating;
		}
  };

})
