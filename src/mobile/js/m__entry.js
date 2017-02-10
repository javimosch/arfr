try {
    /*global gacm*/
    /*global $*/

    gacm.mobile = {};
    gacm.mobile.init = function() {
        return new Promise(function(resolve, reject) {
            if(!gacm.mobile.hasDependencies()) return setTimeout(gacm.mobile.init,100);
            return mrat.init().then(resolve);
        });
        
        
        
        gacm.try(setupPush);
        return gacm.try(dependencies);


        function load(arr) {
            return new Promise(function(resolve, reject) {
                if (arr.length > 0) {
                    console.log('log load ', arr[0]);
                    gacm.loader.require([arr[0]], function() {
                        load(arr.splice(1)).then(resolve);
                    });
                }
                else {
                    console.log('log load finish');
                    resolve();
                }
            });
        }


        function dependencies() {
            return load([
                'http://cdn.bootcss.com/pixi.js/3.0.11/pixi.min.js'
                //'https://code.jquery.com/jquery-2.2.4.min.js',
                //'https://cdnjs.cloudflare.com/ajax/libs/jcanvas/16.7.3/jcanvas.js'
            ]).then(function() {
                console.log('gacm vendor loaded');
            })
        }



    }

    gacm.mobile.hasDependencies = function(){
        //return mpixi && typeof PIXI != 'undefined';
        return mrat;
    };
    gacm.mobile.update = function() {
        if(!gacm.mobile.hasDependencies()) return setTimeout(gacm.mobile.update,100);
        return mrat.update();
        
        
        
        
        return mpixi.init();
        
        var c = document.querySelector('canvas');
        if (c) {
            c.parentNode.removeChild(c);
        }
        c = document.createElement('canvas');
        c.id = 'canvas';
        document.body.appendChild(c);
        
        

        var canvas = document.querySelector('canvas');
        var context = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        $('canvas').width(window.screen.width);
        $('canvas').height(window.screen.height);

        //$('canvas').clearCanvas()
        context.clearRect(0, 0, canvas.width, canvas.height);

        /*
            $('canvas').drawRect({
                fillStyle: 'red',
                x: 0,
                y: 0,
                width: window.screen.width,
                height: window.screen.height,
                fromCenter: false
            });
        */

        $('canvas').addLayer({
            type: 'rectangle',
            fillStyle: 'blue',
            name: 'menu',
            x: 0,
            y: -window.screen.height,
            fromCenter: false,
            width: window.screen.width,
            height: window.screen.height,
            index: 0
        });

        $('canvas').addLayer({
            type: 'rectangle',
            fillStyle: '#585',
            name: 'nav',
            x: 0,
            y: 0,
            fromCenter: false,
            width: window.screen.width,
            height: 50,
            index: 1
        });

        $('canvas').drawRect({
            layer: true,
            name: 'menu-button',
            fillStyle: 'red',
            x: window.screen.width - 60,
            y: 10,
            width: 50,
            height: 30,
            fromCenter: false,
            index: 2,
            touchstart: function(layer) {
                menuToggle = !menuToggle;
                toggleMenu(menuToggle);
            }
        });

        $('canvas').drawLayers();

        var menuToggle = false;

        function toggleMenu(val) {
            if(!val) toggleMenuContent(false);
            $('canvas')
                .animateLayer('menu', {
                    y: val ? 0 : -window.screen.height
                }, {
                    duration: 1000,
                    easing: 'easeInOutQuad',
                    step: function(now, fx, layer) {
                        // do something for each step of the animation
                    },
                    complete: function(layer) {
                        // still do something at end of animation
                        toggleMenuContent(val);
                    }

                });
        }

        function toggleMenuContent(val) {
            $('canvas')
                .animateLayerGroup('nav-section', {
                    opacity: val ? 1 : 0
                }, {
                    duration: val ? 200 : 0,
                    easing: 'easeInOutQuad',
                    step: function(now, fx, layer) {
                        // do something for each step of the animation
                    },
                    complete: function(layer) {
                        // still do something at end of animation
                    }

                });
        }

        $('canvas').drawText({
            opacity: 0,
            index: 2,
            layer: true,
            name: 'menu-tracking',
            groups: ['nav-section'],
            fillStyle: '#9cf',
            strokeStyle: '#25a',
            strokeWidth: 2,
            x: 150,
            y: 100,
            fontSize: 48,
            fontFamily: 'Verdana, sans-serif',
            text: 'Search'
        });



        /*
            $("canvas").drawArc({
                fillStyle: "black",
                x: 100,
                y: 10,
                radius: 10
            });
            */

        if (window.Notification && Notification.permission !== "denied") {
            Notification.requestPermission(function(status) { // status is "granted", if accepted by user
                var n = new Notification('Note', {
                    body: 'Application Updated',
                    icon: '/path/to/icon.png' // optional
                });
            });
        }


    };



    function setupPush() {
        var push = PushNotification.init({
            "android": {
                "senderID": "996868564337"
            },
            "ios": {
                "sound": true,
                "vibration": true,
                "badge": true
            },
            "windows": {}
        });
        push.on('registration', function(data) {
            //data.registrationId
            var Device = gacm.collection('Device');
            Device('register', {
                registrationId: data.registrationId
            });
            var oldRegId = localStorage.getItem('registrationId');
            if (oldRegId !== data.registrationId) {
                localStorage.setItem('registrationId', data.registrationId);
            }
        });

        push.on('error', function(e) {
            console.log("push error = " + e.message);
        });

        push.on('notification', function(data) {
            console.log('notification event');
            navigator.notification.alert(
                data.message + ' read now!', // message
                null, // callback
                data.title, // title
                'Ok' // buttonName
            );
        });
    }
}
catch (e) {
    console.log('log error', e);
    if (gacm.config.debug) throw e;
}