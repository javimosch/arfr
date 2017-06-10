import store2 from 'store2';
const storePrefix = 'ba_';
const store = store2.namespace(storePrefix);
if (window.location.href.indexOf('c9') !== -1 || window.location.href.indexOf('heroku') !== -1) {
    window.store = store;
}
export default function() {
    return {
        name: "$session",
        def: ['$resolver', '$db', function($resolver, $db) {
            var self = {
                updateWith: (data) => {
                    store.set('session', {
                        email: data.email,
                        firstName: data.firstName,
                        lastName: data.lastName
                    });
                },
                saveMetadata: (key, data) => store.set('metadata_' + key, data),
                getMetadata: (key, defaults) => store.get('metadata' + key) || defaults || {},
                saveCredentials: (email, pwd, account) => {
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
                }
            };
            return self;
        }]
    };
}
