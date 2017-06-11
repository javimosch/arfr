    module.exports = {
        firebase: {
            apiKey: "AIzaSyB8riHvf4BwR7qOmAARsB3XRcRfueneUOs",
            authDomain: "meeatful.firebaseapp.com",
            databaseURL: "https://meeatful.firebaseio.com",
            projectId: "meeatful",
            storageBucket: "meeatful.appspot.com",
            messagingSenderId: "520596335619",
            serviceAccount: 'src/client/meetful/meeatful-firebase-adminsdk-sgkyv-9c21097936.json',
            rootPath: 'bastack'
        },
        i18n_config: {
            languages: ['en', 'es'],
            default: 'en',
        },
        deploy: {
            ftp: {
                hostname: 'frontstuff.axfree.com',
                port: 21,
                username: 'frontstu',
                password: process.env.FTP_PASSWORD,
                remoteRoot: 'public_html'
            }
        },
        CDN_CSS: [
            'https://fonts.googleapis.com/css?family=Roboto',
            'https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css',
            'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css'
        ],
        CDN: [
            'https://code.jquery.com/jquery-2.2.2.min.js',
            "https://maps.googleapis.com/maps/api/js?key=AIzaSyAaqnUqCx-nrTzPTlwkP1-lzkCyG9OGPPM&sensor=false&libraries=places",
            "https://checkout.stripe.com/checkout.js",
            "https://www.gstatic.com/firebasejs/live/3.0/firebase.js",
            "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"
        ]
    };
    