module.exports = {
    title: "MisitioBA",
    htmlTitle: "MisitioBA - javascript freelance paris barcelona",
    firebase: {
        apiKey: "AIzaSyA0VOtzgsCAhWAjPtExM04ODD93FsWH09M",
        authDomain: "misitioba.firebaseapp.com",
        databaseURL: "https://misitioba.firebaseio.com",
        projectId: "misitioba",
        storageBucket: "misitioba.appspot.com",
        messagingSenderId: "531480696048",
        serviceAccount: 'src/client/ba/misitioba-firebase-adminsdk-jnnax-9f0a0219b6.json',
        rootPath:'bastack'
    },
    CDN: [
        "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js",
        //"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"
        //"https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular.js",
        'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment-with-locales.js',
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js'
    ],
    i18n_config: {
        languages: ['en', 'es'],
        default: 'en',
    }
};
