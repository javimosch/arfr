var $g = (() => {
    //game engine
    var self = {
        p: {}, //parameters go here
        settings: (p) => {
            if (p.canvas && !p.ctx) {
                p.ctx = p.canvas.getContext('2d');
            }
            self.p = Object.assign(self.p, p);
            $g.renderer.settings(p);
            $g.emit('$g.settings',self.p);
        }
    };
    return self;
})();


(() => {
    //event handling
    var once = {};//stores parameters for events that already happen if there was a 'once' listener. Next listeners will be automatically called.
    var evts = {};
    $g.off = function(evt) {
        if (typeof evt == 'string') delete evts[evt];
        else delete evts[evt.type][evt.id];
    };
    $g.emit = function(n, p) {
        evts[n] = evts[n] || {};
        Object.keys(evts[n]).forEach(k => {
            evts[n][k].handler(p);
        });
    };
    $g.once = function(n, handler) {
        if(once[n]) return handler(once[n]);
        var evt = $g.on(n, (p) => {
            handler(p);
            $g.off(evt);
            once[n] = p;
        });
    };
    $g.on = function(n, handler) {
        evts[n] = evts[n] || {};
        var id = 'evt_' + n + '_' + new Date().getTime() + '_' + Object.keys(evts).length;
        evts[n][id] = {
            id: id,
            type: n,
            handler: handler
        };
        return evts[n][id];
    }
})();


$g.renderer = (() => {
    var stack = [],
        ctx, fillStyle, c;
    var self = {
        settings: (p) => {
            fillStyle: p.fillStyle || 'white';
            ctx = p.ctx;
            c = p.canvas;
        },
        count: () => stack.length,
        register: (object) => {
            stack.push(object);
            stack = stack.sort((a, b) => {
                return a.order || 99 < b.order || 99
            });
        },
        render: () => {
            if (!ctx) return;
            ctx.fillStyle = fillStyle;
            ctx.clearRect(0, 0, c.width, c.height);
            stack.forEach(obj => obj.update());
        },
        run: (settings) => {
            if (settings) $g.settings(settings);

            function repeatOften() {
                self.render();
                requestAnimationFrame(repeatOften);
            }
            repeatOften();
        }
    };
    $g.run = self.run;
    return self;
})();