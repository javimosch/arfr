(function() {
    var arr = [];
    var self = window.$evt = {
        emit: function() {
            var args = Array.prototype.slice.call(arguments),
                n = args.splice(0, 1);
            (arr[n] && arr[n].length > 0 && arr[n].forEach(e => e.apply(e, args)));
            return (arr[n] && arr[n].length > 0) ? true : false;
        },
        off: (t, n) => ((typeof t === 'string' && arr[t] && delete arr[t]) || (typeof t === 'function' && n !== undefined && arr[n].filter(e => e.toString() == t.toString()).length > 0 && arr[n].splice(arr[n].indexOf(t.toString()))) && true) || false,
        on: (n, c) => ((arr[n] && arr[n].push(c)) || (arr[n] = [c])) && (() => self.off(c, n))
    };
})();
