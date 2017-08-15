module.exports = {
    title: "Storeco",
    htmlTitle: "Storeco - collaborative logistics",
    firebase: {
        apiKey: "AIzaSyALdTQlDh0_JV8Z54hlCOskG-QZODzAr00",
        authDomain: "storeco-8a3ad.firebaseapp.com",
        databaseURL: "https://storeco-8a3ad.firebaseio.com",
        projectId: "storeco-8a3ad",
        storageBucket: "storeco-8a3ad.appspot.com",
        messagingSenderId: "884424870040",
        serviceAccount: 'src/client/storeco/storeco-8a3ad-firebase-adminsdk-ir1r4-93994d125b.json',
        rootPath: 'bastack'
    },
    CDN: [
        "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js",
        "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js",
        'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment-with-locales.js',
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js'
    ],
    clientRoutes: [
        'dashboard','create-account'
    ],
    i18n_config: {
        languages: ['en', 'es'],
        default: 'en',
    }
};
