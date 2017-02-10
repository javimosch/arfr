/*global angular*/
/*global $*/
angular.module('app_utils', []).service('appUtils', ['$log', '$http', function($log, $http) {


    var store = (() => {
        return {
            set: (id, raw) => {
                //return new Promise((resolve, error) => {
                id = 'store#' + id;
                try {
                    raw = JSON.stringify(raw);
                    window.localStorage.setItem(id, raw);
                    // resolve();
                    return true;
                }
                catch (e) {
                    console.warn('store setData fails');
                    // error();
                    return false;
                }
                // });
            },
            get: (id) => {
                //return new Promise((resolve, error) => {
                id = 'store#' + id;
                try {
                    var localData = JSON.parse(window.localStorage.getItem(id));
                    //     resolve(localData);
                    return localData;
                }
                catch (e) {
                    console.warn('store getData fails');
                    //      error();
                    return null;
                }
                //})
            }
        }
    })();

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    var queryString = (function() {
        'use strict';
        var queryString = {};

        queryString.parse = function(str) {
            if (typeof str !== 'string') {
                return {};
            }

            str = str.trim().replace(/^\?/, '');

            if (!str) {
                return {};
            }

            return str.trim().split('&').reduce(function(ret, param) {
                var parts = param.replace(/\+/g, ' ').split('=');
                var key = parts[0];
                var val = parts[1];

                key = decodeURIComponent(key);
                // missing `=` should be `null`:
                // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
                val = val === undefined ? null : decodeURIComponent(val);

                if (!ret.hasOwnProperty(key)) {
                    ret[key] = val;
                }
                else if (Array.isArray(ret[key])) {
                    ret[key].push(val);
                }
                else {
                    ret[key] = [ret[key], val];
                }

                return ret;
            }, {});
        };

        queryString.stringify = function(obj) {
            return obj ? Object.keys(obj).map(function(key) {
                var val = obj[key];

                if (Array.isArray(val)) {
                    return val.map(function(val2) {
                        return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
                    }).join('&');
                }

                return encodeURIComponent(key) + '=' + encodeURIComponent(val);
            }).join('&') : '';
        };

        queryString.get = getParameterByName;
        queryString.hashName = function() {
            return (
                (window.location.hash.indexOf('?') !== -1) ?
                window.location.hash.substring(0, window.location.hash.indexOf('?')) : window.location.hash
            ).replace('#/', '');
        };
        queryString.hash = function(str) {
            var hash = (
                (window.location.hash.indexOf('?') !== -1) ?
                window.location.hash.substring(0, window.location.hash.indexOf('?')) : window.location.hash
            );
            if (str == undefined) return hash;
            var params = queryString.parse(window.location.hash.replace(hash, ''));
            var new_params_string = queryString.stringify(params)
            window.history.pushState({}, "", window.location.pathname + '#/' + str + '?' + new_params_string);
        };
        queryString.clear = function() {
            var hash = (
                (window.location.hash.indexOf('?') !== -1) ?
                window.location.hash.substring(0, window.location.hash.indexOf('?')) : window.location.hash
            );
            window.history.pushState({}, "", window.location.pathname + hash);
        };
        queryString.set = function(key, new_value) {
            var hash = (
                (window.location.hash.indexOf('?') !== -1) ?
                window.location.hash.substring(0, window.location.hash.indexOf('?')) : window.location.hash
            );
            var params = queryString.parse(window.location.hash.replace(hash, ''));
            params[key] = new_value;
            var new_params_string = queryString.stringify(params)
            window.history.pushState({}, "", window.location.pathname + hash + '?' + new_params_string);
        }

        if (typeof module !== 'undefined' && module.exports) {
            return queryString;
        }
        else {
            return queryString;
        }
    })();

    function MyPromise(cb) {
        var _scope = {
            cb: null,
            errorCb: null,
            errorRes: null,
            res: null,
            evt: {}
        };
        var resolve = function(res) {
            if (_scope.cb) {
                _scope.cb(res);
            }
            _scope.res = res || {};
        };
        var error = function(errorRes) {
            if (_scope.errorCb) {
                _scope.errorCb(errorRes);
            }
            _scope.errorRes = errorRes || {};
        };
        var emit = function(n, err, r) {
            _scope.evt[n] = _scope.evt[n] || {};
            _scope.evt[n].res = {
                err: err,
                r: r
            };
            if (_scope.evt[n].cb !== undefined) {
                _scope.evt[n].cb(_scope.evt[n].res.err, _scope.evt[n].res.r);
            }
        };
        cb(resolve, error, emit);
        var rta = {
            then: function(cb) {
                if (_scope.res) cb(_scope.res);
                else _scope.cb = cb;
                return rta;
            },
            error: function(errorCb) {
                if (_scope.errorRes) errorCb(_scope.errorRes);
                else _scope.errorCb = errorCb;
                return rta;
            },
            err: function(errorCb) {
                if (_scope.errorRes) errorCb(_scope.errorRes);
                else _scope.errorCb = errorCb;
                return rta;
            },
            on: function(n, cb) {
                _scope.evt[n] = _scope.evt[n] || {};
                _scope.evt[n].cb = cb;
                if (_scope.evt[n].res !== undefined) {
                    _scope.evt[n].cb(_scope.evt[n].res.err, _scope.evt[n].res.r);
                }
                return rta;
            }
        };
        return rta;
    }

    function httpPost(url, data, callback, error) {
        data = data || {};
        $http({
            method: 'POST',
            data: data,
            url: url
        }).then(function(res) {
            if (res.data && res.data.ok == false) {
                $log.warn("ENDPOINT " + url, res.data.err || "INVALID RESPONSE FORMAT");
            }
            return callback(res);
        }, (err) => {
            error(err);
        });

    }
    function httpGet(url, callback, error) {
        $http({
            method: 'GET',
            url: url
        }).then(function(res) {
            if (res.data && res.data.ok == false) {
                $log.warn("ENDPOINT " + url, res.data.err || "INVALID RESPONSE FORMAT");
            }
            return callback(res);
        }, (err) => {
            error(err);
        });

    }

    var Eventify = (function(self) { //event handling snippet
        var once = {}; //stores parameters for events that already happen if there was a 'once' listener. Next listeners will be automatically called.
        var evts = {};

        function firePreserve(n, handler) {
            if (!once[n]) return;
            // console.log('fire-preserve', n, once[n]);
            handler(once[n]);
        }
        self.off = function(evt) {
            if (typeof evt == 'string') {
                delete evts[evt];
                delete once[evt];
            }
            else delete evts[evt.type][evt.id];
        };
        self.emitPreserve = function(n, p) {
            self.emit(n, p, {
                preserve: true
            });
        };
        self.emit = function(n, p, opt) {
            evts[n] = evts[n] || {};
            Object.keys(evts[n]).forEach(k => {
                evts[n][k].handler(p);
            });
            if (opt && opt.preserve) {
                once[n] = p || {};
            }
            var pp = p;
            try {
                pp = JSON.stringify(pp);
            }
            catch (e) {
                pp = p
            }
            //  console.log('emit', n, pp, opt);
        };
        self.once = function(n, handler) {
            if (once[n]) return firePreserve(n, handler);
            var evt = self.on(n, (p) => {
                handler(p);
                self.off(evt);
                once[n] = p;
            });
        };
        self.on = function(n, handler) {
            firePreserve(n, handler);
            //
            evts[n] = evts[n] || {};
            var id = 'evt_' + n + '_' + new Date().getTime() + '_' + Object.keys(evts).length;
            evts[n][id] = {
                id: id,
                type: n,
                handler: handler
            };
            // console.log('on', n, id);
            return evts[n][id];
        }
        return self;
    });

    function onAnchorChange(handler) {
        if (false && "onhashchange" in window) { // event supported?
            window.onhashchange = function() {
                handler(window.location.hash);
            }
        }
        else { // event not supported:
            var storedHash = window.location.hash;
            window.setInterval(function() {
                if (window.location.hash != storedHash) {
                    storedHash = window.location.hash;
                    handler(storedHash);
                }
            }, 100);
        }
    }

    var hasMouse = (change) => {
        $('html').on('mousemove', (e) => {
            change(true);
            $('html').off('mousemove');
        });
        change(false);
    };

    function scrollToTop(time) {
        $('html, body').animate({
            scrollTop: 0
        }, time || 800);
    }

    function replaceAll(word, search, replacement) {
        return word.replace(new RegExp(search, 'g'), replacement);
    };

    var self = {
        replaceAll: replaceAll,
        scrollToTop: scrollToTop,
        hasMouse: hasMouse,
        onAnchorChange: onAnchorChange,
        store: store,
        url: queryString,
        Promise: MyPromise,
        httpPost: httpPost,
        httpGet:httpGet
    };
    self = Eventify(self);
    window._appUtils = self;
    return self;
}]);
