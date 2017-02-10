angular.module('shopmycourse.controllers', [])

.controller('AppCtrl', function($scope, $state) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    $scope.state = toState.name
  })
})
