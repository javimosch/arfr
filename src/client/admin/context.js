module.exports = {
    title: "AdminPanel",
    firebaseURL: 'meeatful',
    serviceAccount: 'meeatful-firebase-adminsdk-sgkyv-9c21097936.json',
    databaseURL: 'https://meeatful.firebaseio.com/',
    signalName: 'bastack',
    i18n_config: {
        languages: ['en', 'es'],
        default: 'en',
    },
    CDN: [
        "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js",
        //"https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular.js",
        'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment-with-locales.js',
        'https://cdn.rawgit.com/indrimuska/angular-moment-picker/master/dist/angular-moment-picker.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js',
        'https://maps.googleapis.com/maps/api/js?libraries=places'
        //&amp;key=AIzaSyB8riHvf4BwR7qOmAARsB3XRcRfueneUOs
    ],
    rollupExternal: [
        'babel-polyfill','co',
        'angular','angular-route'
    ]
};
