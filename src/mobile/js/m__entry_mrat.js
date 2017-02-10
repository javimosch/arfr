/*global mrat*/
/*global loadjs*/
/*global gacm*/
var mrat = {};

{
    var screens = {
        ok: false,
        ready: {},
        items: [
            'util_global',
            'constants',
            'screen_dashboard',
            'screen_tracking',
            'screen_profile'
        ],
        update: function() {
            var keys = Object.keys(screens.ready);
            for (var x in keys) {
                if (!screens.ready[keys[x]]) {
                    return screens.ok = false;
                }
            }
            //console.log('log screens ok',screens.ready);
            screens.ok = true;
        }
    };
    screens.items.forEach(function(n) {
        gacm.clearEvent(n);
        gacm.once(n, function() {
            screens.ready[n] = true;
            screens.update();
        });
    });


    function meetDependencies() {
        var rta = mrat && loadjs && loadcss && screens.ok;
        console.log('log meet deps', rta);
        return rta;
    };

    function waitForDependencies(handler) {
        if (!mrat.meetDependencies()) {
            setTimeout(function() {
                return waitForDependencies(handler)
            }, 100);
        }
        else {
            return handler();
        }
    }

    function createRouting() {


        gacm.clearEvent('route');
        gacm.on('route', function(name) {
            console.log('log route ', name);
            fetch(gacm.config.assetsURL + '/partial/' + name, {
                    mode: 'cors'
                })
                .then(function(response) {
                    return response.text()
                }).then(function(body) {
                    console.log('log route ', name, 'fetch success');
                    var el = document.querySelector('#wrapper');
                    if (!el) {
                        el = document.createElement('div');
                        el.id = 'wrapper';
                        document.body.appendChild(el);
                    }
                    
                    
                    el.innerHTML = '';
                    
                    var detachEl = document.createElement('div');
                    detachEl.innerHTML = body;
                    
                    var screenName = detachEl.querySelector('#main').dataset.screen;
                    console.log('log route ', name, 'screenName', screenName);
                    gacm.emit('screen_' + screenName + '_init',{
                        template:body
                    });
                });
        });

    }

    function update() {
        return new Promise(function(resolve, reject) {
            createRouting();
            gacm.emit('route', 'mrat_dashboard.html');
            resolve();
        });

    }

    function loadDependencies() {
        return loadcss([
            //gacm.config.assetsURL + '/src/css/common/ratchet.min.css',
            // gacm.config.assetsURL + '/src/css/common/ratchet-theme-android.min.css'
        ]).then(function() {
            return loadjs([
                //gacm.config.assetsURL + '/src/ratchet.js'
                'http://cdn.ractivejs.org/latest/ractive.js',
                'https://code.jquery.com/jquery-2.2.4.min.js',
            ]);
        });
    }

    mrat.init = function() {
        return new Promise(function(resolve, reject) {
            loadDependencies().then(function() {
                console.log('mrat init');
                resolve();
            });
        });
    };
    mrat.update = function() {
        console.log('log mrat update');
        return new Promise(function(resolve, reject) {
            if (!meetDependencies()) waitForDependencies(init);
            else init();

            function init() {

                console.log('log mrat update going');
                update().then(resolve);
                console.log('log mrat update success');
            }
        });
    }
}