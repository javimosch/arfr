angular.module('shopmycourse.services')

/**
 * @name Camera
 * @function Service
 * @memberOf shopmycourse.services
 * @description Gestion de la caméra/galerie du téléphone
*/

.service('Camera', function () {
	return {
		/**
		 * @name getPicture
		 * @description Récupération d'une image à partir de l'appareil photo ou de la galerie du téléphone
		*/
		getPicture: function (type, callback, toastr) {
			if(type == 0) {
				sourceType = Camera.PictureSourceType.CAMERA
			} else {
				sourceType = Camera.PictureSourceType.PHOTOLIBRARY
			}
			navigator.camera.getPicture(function(imageData) {
				callback(imageData);
			}, function(message) {
			}, {
				destinationType: Camera.DestinationType.DATA_URL,
				targetWidth: 500,
				targetHeight: 500,
				cameraDirection: Camera.Direction.FRONT,
				sourceType: sourceType
			});
		}
	}
})
