angular.module('shopmycourse.services', ['ngResource'])


.service('Browser', function($rootScope, UserAPI, HTTPInterceptor) {
  var getName = (function() {
    var ua = window.navigator.userAgent,
      tem,
      M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join('');
  })().replace(' ', '').toLowerCase();

  return {
    name: getName
  }
})

.service('$stateHistory', function($state, $rootScope) {
  var self = {};
  var _history = [];
  self.push = function(name, params) {
    _history.push({
      name: name,
      params: params
    });
    //console.log('history has now',_history.length,'states');
  };
  self.goBack = function(settings) {
    if (_history.length <= 1) {
      if (settings.onFailure) settings.onFailure();
      else console.log('$stateHistory history length', _history.length);
      return
    }
    _history.pop();
    var last = _history[_history.length - 1];
    $state.go(last.name, last.params);
    if (settings.onSuccess) settings.onSuccess();
  };
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    self.push(toState.name, toParams);
  });
  return self;
});

