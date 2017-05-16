/*global $*/
/*global $U*/
$(function() {
    var TICK_INTERVAL = 200;
    var els = null;
    var interval = setInterval(function() {
        
        if(typeof $U == 'undefined'){
            clearInterval(interval);
            console.warn('$U required');
        }
        
        if (!els) return;
        var el = null;
        els.each(function() {
            el = $(this);
            if (el.get(0).dataset.bindShow) bindShow(el, el.get(0).dataset);

            for (var x in el.get(0).dataset) {
                if (x.indexOf('bindClass') !== -1) {
                    bindClass(el, el.get(0).dataset);
                    break;
                }
            }
        })

    }, TICK_INTERVAL);

    setInterval(function() {
        els = $("[data-bind]");
    }, 1000);

    function resolveJqueryCondition(val) {
        var rta = false;
        var split = val.split('|');
        var selector = split[0];
        var method = split[1];
        var prop = split[2];
        var operator = split[3];
        var expected = split[4];
        var target = $(selector);
        if (target.length > 0) {
            if (target[method]) {
                if (operator == 'eq') {
                    rta = target[method](prop) == expected;
                }
                if (operator == 'ne') {
                    rta = target[method](prop) !== expected;
                }
                if (operator == 'has') {
                    rta = target[method](prop).indexOf(expected) !== -1;
                }
                return rta;
            }
        }
        return rta;
    }

    function isJqueryCondition(val) {
        return val.split('|').length == 5;
    }

    function isScopeValue(val) {
        return val.indexOf('scope.') != -1;
    }

    function resolveScopeValue(scope, val) {
        val = val.replace('scope.', '');
        if (val.indexOf('!') !== -1) {
            val = val.replace('!', '');
            return !$U.val(scope, val);
        }
        else {
            return $U.val(scope, val);
        }
    }

    function iterateBinding(dataset, bindingName, handler) {
        var lstRta = null;
        if (dataset[bindingName]) {
            lstRta = handler(dataset[bindingName]);
        }
        if(lstRta==true) return; //AND
        var consecutiveUndefined = 0;
        for (var x = 0; x < 100; x++) {
            if (consecutiveUndefined > 2) {
                return;
            }
            if (dataset[bindingName + x.toString()]) {
                consecutiveUndefined = 0;
                lstRta = handler(dataset[bindingName + x.toString()]);
                if(lstRta==true) return; //AND
            }
            else {
                consecutiveUndefined++;
            }
        }
    }

    function bindShow(el, dataset) {

        iterateBinding(dataset, 'bindShow', function(val) {
            var rta = false;
            if (isJqueryCondition(val)) {
                rta = resolveJqueryCondition(val);
                el.toggle(rta);
                el.removeAttr('data-bind-cloak');
            }

            if (isScopeValue(val)) {
                var scope = ($U.val(window, dataset.bindScope) || window);
                rta = resolveScopeValue(scope, val);
                el.toggle(rta);
                el.removeAttr('data-bind-cloak');
            }
            return rta;
        });

    }

    function bindClass(el, dataset) {
        var scope = ($U.val(window, dataset.bindScope) || window);
        var val = null,
            cls = '';
        for (var x in dataset) {
            if (x.indexOf('bindClass') !== -1) {
                val = dataset[x];
                cls = x.replace('bindClass', '').toLowerCase();
                if (isJqueryCondition(val)) {
                    if (resolveJqueryCondition(val)) {
                        el.addClass(cls);
                    }
                    else {
                        el.removeClass(cls);
                    }
                    continue;
                }
                if (isScopeValue(val)) {
                    if (resolveScopeValue(scope, val)) {
                        el.addClass(cls);
                    }
                    else {
                        el.removeClass(cls);
                    }
                    continue;
                }
            }
        }
    }

});