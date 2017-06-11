import store2 from 'store2';
const storePrefix = 'ba_';
const store = store2.namespace(storePrefix);
export default function() {
    return {
        name: "$session",
        def: ['$resolver', '$log', '$db', function($resolver, $log, $db) {

            $resolver.expose('store', store);

            function sessionFields(data) {
                return {
                    email: data.email || '',
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    role: data.role || ''
                };
            }

            var self = {
                setToken: (t) => {
                    $log.info('Token set!',t);
                    self.token = t;
                    self.saveMetadata('token',self.token)
                },
                logout: () => {
                    delete self.token;
                    var email = self.email;
                    self.updateWith('', sessionFields({}));
                    store.clearAll();
                    self.saveCredentials(email, '');
                },
                refreshLocalData: () => {
                    var fields = sessionFields(store.get('session', sessionFields({})));
                    Object.keys(fields).forEach(k => self[k] = fields[k]);
                    self.token = self.getMetadata('token', '');
                },
                updateWith: (token, data) => {
                    self.setToken(token);
                    store.set('session', sessionFields(data));
                    self.refreshLocalData();
                },
                saveMetadata: (key, data) => store.set('metadata_' + key, data),
                getMetadata: (key, defaults) => store.get('metadata_' + key) || defaults || {},
                saveCredentials: (email, pwd) => {
                    self.saveMetadata('credentials', {
                        email: email,
                        pwd: window.btoa(pwd)
                    });
                },
                getCredentials: () => {
                    var cred = self.getMetadata('credentials', {
                        email: '',
                        pwd: ''
                    });
                    cred.pwd = cred.pwd != '' ? window.atob(cred.pwd) : '';
                    return cred;
                },
                refreshToken: () => {
                    return $resolver.coWrapExec(function*() {
                        self.token = self.token || self.getMetadata('token', '');
                        if (self.token) {
                            yield $db.auth.refreshToken({
                                token: self.token
                            });
                        }
                    });
                }
            };
            self.refreshLocalData();
            $resolver.expose('$session', self);
            return self;
        }]
    };
}
