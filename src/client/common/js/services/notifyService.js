export default function() {
    return {
        name: "$notify",
        def: [
            'ngNotify', '$log',
            function(ngNotify, $log) {
                const GENERIC_ERROR = "Something was wrong, can you email support ?";
                /*
                info (default)
                error
                success
                warn
                grimace
                */
                function normalizeArguments(args) {
                    if (args.length === 0) args.push('Empty message');
                    for (var x in args) {
                        if (typeof args[x] === 'function') {
                            args[x] = JSON.stringify(args[x]);
                        }
                    }
                    if (typeof args[0] === 'object') {
                        var prefix = '';
                        if (args[0].err && !args[0].err.code) prefix += 'API: ';
                        if (args[0].err && args[0].err.detail) args = args[0].err.detail;
                        if (args[0].err && args[0].err.description) args = args[0].err.description;
                        if (args[0].err && args[0].err.msg) args = args[0].err.msg;
                        if (args[0].err && args[0].err.message) args = args[0].err.message;
                    }
                    if (typeof args === 'string') args = [prefix + args];
                    return args;
                }

                ngNotify.handleInvalidResponse = function(middleware) {
                    return function(res) {
                        function next() {
                            if (res.ok) {
                                return $log.warn('Response is OK, you should not call this fn.', res);
                            }
                            if (res.ok !== undefined && res.ok == false) {
                                if (res.err && (!res.err.code && !res.err.Code)) {
                                    return ngNotify.handleError(res);
                                }
                                return ngNotify.handleWarning(res);
                            }
                            return ngNotify.handleError(res);
                        }
                        if (middleware) middleware(next);
                        else next();
                    }
                }

                ngNotify.handleWarning = function() {
                    var args = Array.prototype.slice.call(arguments)
                    $log.warn.apply($log, args);
                    args = normalizeArguments(args);
                    ngNotify.set(args.join(' '), {
                        type: 'warn'
                    });
                }
                ngNotify.handleError = function() {
                    var args = Array.prototype.slice.call(arguments)
                    $log.error.apply($log, args);
                    args = normalizeArguments(args);
                    ngNotify.set(GENERIC_ERROR, {
                        type: 'error'
                    });
                }

                return ngNotify;
            }
        ]
    }
}
