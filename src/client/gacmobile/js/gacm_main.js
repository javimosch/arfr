/*global Loader*/
/*global fetch*/
/*global fireload*/
console.log('gacm_main');
var gacm = window.gacm = {};

gacm.ready = (handler) => {
    gacm.once(gacm._event.ready, handler);
};


gacm._event = {
    ready: 'ready'
};
gacm.clearEvent = (name)=>{
    gacm._events = gacm._events || {};
    delete gacm._events[name];
    gacm._events_once = gacm._events_once || {};
    delete gacm._events_once[name];
    gacm._event_emitted = gacm._event_emitted || {};
    delete gacm._event_emitted[name];
};
gacm.once = (name, handler) => gacm.on(name, handler, true);
gacm.on = (name, handler, once) => {
    once = once || false;
    gacm._events = gacm._events || {};
    gacm._events[name] = gacm._events[name] || {};
    var id = Date.now() + '_' + Object.keys(gacm._events[name]).length;
    if (once && gacm._event_emitted && gacm._event_emitted[name]) {
        //console.log('gacm emit ',name,' handler (emitted)','id',id);
        handler();
    }
    else {
        gacm._events[name][id] = handler;
        if (once) {
            gacm._events_once = gacm._events_once || {};
            gacm._events_once[name] = gacm._events_once[name] || {};
            gacm._events_once[name][id] = true;
        }
        //console.log('gacm register handler ', id, 'for', name, 'once?', once);
    }
}
gacm.emit = (name, p) => {
    gacm._event_emitted = gacm._event_emitted || {};
    gacm._event_emitted[name] = true;
    gacm._events = gacm._events || {};
    gacm._events[name] = gacm._events[name] || {};
    Object.keys(gacm._events[name]).forEach(id => {
        gacm._events[name][id](p);
        if (gacm._events_once &&  gacm._events_once[name] && gacm._events_once[name][id]) {
            delete gacm._events[name][id];
            //delete gacm._events_once[name][id];
            //console.log('gacm event handler removed', name, id);
        }
    });
     console.log('log gacm EMIT',name,'params',p,'times', Object.keys(gacm._events[name]).length);
}
gacm.eventLog = () => {
    console.log('gacm events', gacm._events);
    console.log('gacm events once', gacm._events_once);
    console.log('gacm events emitted', gacm._event_emitted);
};




gacm.configure = (config) => {
    gacm.config = config;
    console.log('gacm configure', config);

    gacm.fetchConfiguration();
};

gacm.updateAssets = (handler) => {
    if (!gacm.config.assetsURL) {
        return console.warn('log updateAssets require config.assetsURL');
    }


    gacm.loader.css(gacm.config.assetsURL + '/css/app.css', 'appcss').then(() => {

        gacm.loader.require([gacm.config.assetsURL + '/js/app.js'], function() {
            console.log('gacm asset app.js loaded.');
            if (handler) handler();
        },'appjs');

    })


}

gacm.configuration = {
    init: () => {
        gacm.config = Object.assign(gacm.configuration.defaults, gacm.config);
        gacm.config.verbose = gacm.config.verbose == '1';
        gacm.config.debug=gacm.config.debug||true;
        console.log('gacm configuration success', gacm.config);
    },
    defaults: {
        verbose: '1'
    }
}

gacm.try = function(handler) {
    try {
        return handler();
    }
    catch (e) {
        console.log('log error ', e);
        return new Promise(function(resolve, reject) {});
    }
};

gacm.fetchConfiguration = () => {
    var Configuration = gacm.collection('Configuration');
    Configuration('getByCode', {
        code: gacm.config.configurationIdentifier
    }).then((res) => {

        if (res.ok && res.result) {
            //console.log('gacm fetchConfiguration ', res.result);
            gacm.config = Object.assign(gacm.config, res.result.config);
            gacm.configuration.init();
            gacm.updateAssets(() => {
                if (gacm.mobile) {
                    console.log('log gacm.mobile.init');
                    gacm.mobile.init().then(()=>{
                        gacm.try(gacm.mobile.update);
                    });
                    
                }
                else {
                    console.warn('log gacm.mobile not found after updating assets');
                }
            });

            gacm.emit('configured');


            //sync assets
            gacm.reload.start({
                signalName: gacm.config.liveSync.signalName,
                enable: gacm.config.liveSync.enable,
                verbose: false,
                reload: false,
                apiKey: gacm.config.liveSync.apiKey,
                authDomain: gacm.config.liveSync.authDomain,
                databaseURL: gacm.config.liveSync.databaseURL,
            }, () => {

                gacm.updateAssets(() => {
                    gacm.mobile.update();
                });

            });


            //fullreload
            gacm.reload.start({
                signalName: gacm.config.liveSync.reloadSignalName,
                enable: gacm.config.liveSync.enable,
                verbose: true,
                reload: true,
                apiKey: gacm.config.liveSync.apiKey,
                authDomain: gacm.config.liveSync.authDomain,
                databaseURL: gacm.config.liveSync.databaseURL,
                storeKey: 'gacm-livesync-reload'
            });


        }

    });
};



(() => {

    function isReady() {
        if (!(Loader)) return false;
        if (!fetch) return false;
        if (!fireload) return false;
        if (!Promise) return;
        if (!loadCSS) return;
        if (!onloadCSS) return;
        return true;
    }


    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };
    var _interval = setInterval(() => {
        if (isReady()) {
            clearInterval(_interval);
            gacm.loader = new Loader();
            gacm.fetch = fetch;
            gacm.reload = fireload;

            gacm.loader.css = (path, id, beforeEl) => {
                //console.log('log gacm loader css ',path,id);
                if (id) {
                    var ss = document.querySelector(id);
                    if (ss) {
                        ss.parentNode.removeChild(ss);
                    }
                }
                var sheet = loadCSS(path, beforeEl);
                sheet.id = id;
                return new Promise(function(resolve, reject) {
                    onloadCSS(sheet, resolve);
                });
            }

            gacm.collection = (name) => {
                if (!gacm.config || (gacm.config && !gacm.config.serverURL)) {
                    return console.warn('gacm call configure serverURL required');
                }
                return (action, data) => {
                    var path = gacm.config.serverURL + '/ctrl/' + name + '/' + action;
                    path = path.replaceAll('//', '/');
                    path = path.replaceAll(':/', '://');
                    console.log('gacm fetch path', path);

                    /*
                                        var p = new promise.Promise();
                                        gacm.fetch.post(path, data, {
                                            "Accept": "application/json"
                                        }).then((error, res) => {
                                            p.done(JSON.parse(res));
                                        });
                    */

                    return fetch(path, {
                        //mode:'cors',
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    }).then(function(response) {
                        return response.json()
                    });

                }
            };


            //gacm.emit(gacm._event.ready, {});

            //console.log('gacm loader ready');
            //gacm.loader.ready(document, function() {
            //console.log('gacm loader ready success');
            gacm.emit(gacm._event.ready, {});
            //});
        }
    }, 100);
})();
