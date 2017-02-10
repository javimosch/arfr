/*global angular*/
angular.module('cloudinary-config',[]).config(['cloudinaryProvider', function (cloudinaryProvider) {
  cloudinaryProvider
      .set("cloud_name", "paris7510")
      //.set("upload_preset", "UUUUUUUU");
}]);