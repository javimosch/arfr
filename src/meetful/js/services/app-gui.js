/*global angular*/
var app = angular.module('app_gui', []).service('appGui', ['$rootScope', '$log', '$timeout', function(r, $log, $timeout) {
    var self = {};
    self.dom = function(cb, timeout) {
        $timeout(function() {
            if (cb) {
                cb();
            }
            r.$apply();
        }, timeout || 0);
    };

    function getMessage(msg) {
        if (!msg) return '';
        if (typeof msg === 'function') return msg();
        if (typeof msg !== 'string' && msg.length) return getMessage(msg[0]);
        return msg;
    }

    self.errorMessage = (msg, duration) => {
        msg = getMessage(msg);
        if (!msg) {
            msg = 'Erreur de serveur, plus d&#x27;informations dans la console de développement.';
        }
        r.notify(msg, {
            type: 'danger',
            duration: duration || 3000
        });
        return false;
    };
    self.warningMessage = (msg, duration) => {
        msg = getMessage(msg);
        r.notify(msg, {
            type: 'warning',
            duration: duration || 3000
        });
        return false;
    };
    self.infoMessage = (msg, duration) => {
        msg = getMessage(msg);
        r.notify(msg, {
            type: 'info',
            duration: duration || 3000
        });
        return true;
    };
    self.successMessage = (msg, duration) => {
        msg = getMessage(msg);
        r.notify(msg, {
            type: 'success',
            duration: duration || 3000
        });
        return true;
    };
    self.toggleNavbar = function(val) {
        r.navShow = val;
        self.dom();
    };
    self.toggleBody = function(val) {
        self.dom(function() {
            var el = document.body;
            el.className = el.className.replace('hidden', '').trim();
            if (!val) {
                el.className = (el.className + ' hidden').trim();
            }
        });
    };
    window._appGui = self;
    return self;
}]);
