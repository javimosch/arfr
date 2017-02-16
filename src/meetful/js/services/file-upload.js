/*global $*/
/*global angular*/
angular.module('service-file-upload', ['ngFileUpload']).service('fileUpload', ['$http', '$log', 'Upload', function($http, $log, Upload) {
    this.single = function(opt, success, err) {
        opt.data = {
            dataAsString: opt.data,
            file: opt.file
        };
        Upload.upload({
            url: opt.url,
            data: opt.data
        }).then(function(resp) {
            //console.log('Success ', resp.config.data.file.name, 'uploaded. Response: ', resp.data);
            success(resp.data);
        }, function(resp) {
            //console.log('Error status: ', resp.status);
            err(err);
        }, function(evt) {
            //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            //console.log('progress: ', progressPercentage, '% ', evt.config.data.file.name);
        });
    };
}]);
