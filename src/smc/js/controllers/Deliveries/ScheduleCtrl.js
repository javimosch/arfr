angular.module('shopmycourse.controllers')

/**
 * @name DeliveriesScheduleCtrl
 * @function Controleur
 * @memberOf shopmycourse.controllers
 * @description Sélection des créneaux d'une ou plusieurs propositions de livraison
 */

.controller('DeliveriesScheduleCtrl', function($scope, $rootScope, LoadingModal, $state, CurrentUser, CurrentAvailability, AvailabilityAPI, CurrentDelivery, DeliveryStore, CurrentAddress, lodash, moment, DomRefresher,CustomModal,$log) {

  window.s = $scope;
  
  CurrentAvailability.awake.then(function(local){
    $scope.availability = local;
    DomRefresher();
  });
  
  $scope.shopDescription = function(){
    if(!$scope.availability) return '';
    if(!$scope.availability.shop) return '';
    return $scope.availability.shop.name+', '+$scope.availability.shop.address;
  };
  
  $scope.hasSelectedTimes = function(){
      return $scope.selected && Object.keys($scope.selected).length > 0 && $scope.selected[Object.keys($scope.selected)[0]]!=undefined 
      && $scope.selected[Object.keys($scope.selected)[0]].length > 0;
  };
  
  /**
   * Génération des créneaux de livraison à partir de maintenant
   */
  $scope.schedule =  null;
  $scope.selected = {};
  $scope.date = '';
  var times = ['08h - 10h', '10h - 12h', '12h - 14h', '14h - 16h', '16h - 18h', '18h - 20h', '20h - 22h'];
  var now = moment();
  $scope.onSelect = function(date) {

    var day = moment(date).hours(0).minutes(0).seconds(0);
    var scheduleTimes = [];
    lodash.each(times, function(time) {
      var hours = time.replace('h', '').split('-');
      var start = parseInt(hours[0]);

      day.hours(start);
      if (day.unix() >= (now.unix() - (90 * 60))) {
        scheduleTimes.push(time);
      }
    });

    DomRefresher(function() {
      $scope.schedule = {
        date: date.toDate(),
        times: scheduleTimes
      };
    });

  }

 

  
  var successModal = CustomModal("/templates/modals/default.html", {
    modalImg: 'img/notifs/bravo.png',
    modalTitle: "Bravo !",
    modalMessage:"Votre proposition de livraison a été enregistrée. Vous serez notifié dés qu'une demande de livraison correspondra à vos critères.",
    close: function() {
      this.resolveModal(true);
    }
  });

  /**
   * @name $scope.validate
   * @description Vérifie qu'au moins un créneau a été sélectionné avant enregistrement de ceux-ci
   */
  $scope.validate = function() {
    //if (Object.keys($scope.selected).length > 0) {
      LoadingModal.show('Nous enregistrons votre disponibilité...');
      CurrentAvailability.setSchedules($scope.selected, function(currentAvailability) {
        AvailabilityAPI.create(currentAvailability, function() {
          $log.debug('DEBUG: Availabilities created !');
          LoadingModal.hide();
        }, function(err) {
          $log.warn('WARN: Erreur',err);
          LoadingModal.hide();
        });
        successModal.show().then(function(){
          $state.go('tabs.home');
        });
      });
  };
  
  
  /**
   * @name $scope.selectTime
   * @description Sélection d'un ou plusieurs créneaux
   */
  $scope.selectTime = function(date, time) {
    // Si la case est déjà selectionnées
    if ($scope.isSelected(date, time)) {
      var index = $scope.selected[date].indexOf(time);
      $scope.selected[date].splice(index, 1);
      if ($scope.selected[date].length == 0) {
        delete $scope.selected[date];
      }
      return;
    }
    // Si la case n'est pas selectionnées
    else {
      if (!$scope.selected[date] || $scope.selected[date].length <= 0) {
        $scope.selected[date] = []
      }
      $scope.selected[date].push(time);
    }
  };

  /**
   * @name $scope.isSelected
   * @description Vérifie si le créneau a déjà été sélectionné
   */
  $scope.isSelected = function(date, time) {
    if (!$scope.selected[date] || $scope.selected[date].length <= 0) {
      return false;
    }
    return ($scope.selected[date].indexOf(time) > -1);
  };


/*
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function() {
    $scope.dt = null;
  };

  $scope.options = {
    customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };

  // Disable weekend selection
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }

  $scope.toggleMin = function() {
    $scope.options.minDate = $scope.options.minDate ? null : new Date();
  };

  $scope.toggleMin();

  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date(tomorrow);
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [{
    date: tomorrow,
    status: 'full'
  }, {
    date: afterTomorrow,
    status: 'partially'
  }];

  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  }
  */

});
