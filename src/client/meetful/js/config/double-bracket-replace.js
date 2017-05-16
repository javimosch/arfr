/*global angular*/
angular.module('config-replace-brackets',[]).config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
});