module.exports = {
    title: "HealtGamesLove",
    firebaseURL: 'meeatful',
    serviceAccount: 'meeatful-firebase-adminsdk-sgkyv-9c21097936.json',
    databaseURL: 'https://meeatful.firebaseio.com/',
    signalName: 'live-sync',
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
