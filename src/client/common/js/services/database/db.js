export default function() {
    return {
        name: '$db',
        def: [
            '$http', '$log', 'usSpinnerService',
            function($http, $log, usSpinnerService) {
                var self = {};
                var requests = 0;
                var sessionToken = '';
                self.isBusy = () => requests == 0;
                self.getRequests = () => requests;
                self.addController = (n, actions) => {
                    self[n] = {};
                    actions.forEach(action => {
                        self[n][action] = (data) => {
                            if (sessionToken) data._token = sessionToken;
                            return new Promise((resolve, reject) => {
                                usSpinnerService.spin('spinner-1');
                                requests++;
                                $http.post('/api/' + n + '/' + action, data, {}).then(handleResponse(resolve, reject, $log), handleResponse(reject, null, n === 'auth'));

                            });
                        };
                    })
                };

                function handleResponse(resolve, reject, isAuth) {
                    requests--;
                    setTimeout(() => usSpinnerService.stop('spinner-1'), 1000);
                    return function(data, status, headers, config) {
                        reject = reject || resolve;
                        var handler = resolve;

                        if (data.data && data.data.ok !== undefined) {
                            data = data.data;
                            if (data.ok === false) {
                                handler = reject;
                                $log.warn('DB', data.err);
                            }
                            else {
                                $log.info('DB', data.result);
                                data = data.result;

                                if (data._token && isAuth) {
                                    sessionToken = data._token;
                                    delete data._token;
                                    $log.info('Token set !');
                                }
                            }
                        }
                        else {
                            $log.error('DB', data, status, config.headers);
                        }


                        handler(
                            data, {
                                data: data,
                                status: status,
                                headers: headers,
                                config: config
                            });
                    };
                }


                return self;
            }
        ]
    };
}
