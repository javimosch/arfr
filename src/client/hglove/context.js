module.exports = {
    title: "HealtGamesLove",
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
            hostname: '31.220.16.123',
            port: 21,
            username: 'u430228487.hglove',
            password: process.env.FTP_PASSWORD,
            remoteRoot: ''
        }
    },
};
