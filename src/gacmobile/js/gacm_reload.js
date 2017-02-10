var fireload = (() => {
    /*global firebase*/
    /*global localStorage*/

    var defaults = {
        enable: true,
        verbose: true,
        reload: true,
        isPaused: false,
        storeKey: 'livesync',
        signalName: 'default'
    };

    function run(opt, handler) {
        var counter = localStorage[opt.storeKey] && parseInt(localStorage[opt.storeKey]) || 0;
        if (opt.verbose) console.log('log live-sync-enabled signalName', opt.signalName, 'counter', counter, 'storeKey', opt.storeKey);
        var ref = firebase.initializeApp({
            apiKey: opt.apiKey,
            authDomain: opt.authDomain,
            databaseURL: opt.databaseURL,
            storageBucket: "",
        }, 'gacm-reload-' + Date.now() + '-' + opt.signalName).database().ref(opt.signalName + '/signals/reload');

        ref.on('value', function(snap) {
            if (!opt.enable) {
                if (opt.verbose) {
                    console.log('log live-sync reload disabled');
                }
                return;
            }
            if (isPaused) {
                if (opt.verbose) {
                    console.log('log live-sync reload pause');
                }
                return;
            }
            if (opt.verbose) console.log('log live-sync check ', opt.signalName, ' snap-val', snap.val());
            if (snap.val() != counter) {
                if (snap.val() == null || snap.val() == undefined) return; //nothing happen yet
                localStorage[opt.storeKey] = snap.val().toString();
                if (opt.verbose) console.log('log live-sync reload', 'fullreload?', opt.reload);
                if (opt.reload) {
                    setTimeout(function() {
                        window.location.reload();
                    }, 0);

                }
                if (handler) handler();
            }
            else {
                if (opt.verbose) console.log('log live-sync waiting');
            }
        });
    }

    var isPaused = false;

    function start(opt, handler) {
        if (!firebase) return startFirebase(opt, handler);
        opt = opt || defaults;
        opt = Object.assign(defaults, opt);

        if (!opt.apiKey) return console.warn('log live-sync require apiKey');
        if (!opt.authDomain) return console.warn('log live-sync require authDomain');
        if (!opt.databaseURL) return console.warn('log live-sync require databaseURL');

        var asd = {};
        for (var x in opt) {
            asd[x] = opt[x];
        }
        run(asd, handler);
    };

    function startFirebase(opt, handler) {
        setTimeout(() => start(opt, handler), 100);
    }

    return {
        pause: () => {
            isPaused = true;
        },
        resume: () => {
            isPaused = false;
        },
        start: start
    }
})();