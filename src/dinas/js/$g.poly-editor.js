/*global $g*/
$g.polyEditor = (() => {
    var STATE = {
        POWER_OFF: 'POWER_OFF',
        DISABLED: 'DISABLED',
        POWER_ON: 'POWER_ON',
        START_POINT_WAIT: 'START_POINT_WAIT',
        NEXT_POINT_WAIT: 'NEXT_POINT_WAIT',
        NEXT_POINT_DONE: 'NEXT_POINT_DONE',
        LAST_POINT: 'LAST_POINT',
        PATH_END: "PATH_END"
    };
    var ctx, strokeStyle = 'black',
        mouse = null,
        emitter, renderer;
    var state = STATE.POWER_OFF;
    var path = [];


    function drawPath() {
        ctx.beginPath();
        var p = null;
        ctx.strokeStyle = strokeStyle;
        for (var x = 0; x < path.length; x++) {
            p = path[x];
            if (x == 0) ctx.moveTo(p.x, p.y);
            else {
                ctx.lineTo(p.x, p.y);
            }
        }
        ctx.stroke();
        ctx.closePath();
    }

    var lastTick = new Date().getTime();

    function update() {
        var tick = new Date().getTime();
        if (tick - lastTick > 1000) {
            lastTick = tick;
            console.log(state, JSON.stringify(path));
        }
        if ([STATE.POWER_OFF, STATE.DISABLED].some(v => v == state)) return;
        if (state == STATE.START_POINT_WAIT) {

            ctx.moveTo(mouse.x, mouse.y);
            path = [{
                x: mouse.x,
                y: mouse.y
            }];
            return (state = STATE.NEXT_POINT_DONE)
        }
        if (state == STATE.NEXT_POINT_WAIT) {
            path.push({
                x: mouse.x,
                y: mouse.y
            });
            drawPath();
            return (state = STATE.NEXT_POINT_DONE);
        }
        if (state == STATE.NEXT_POINT_DONE) {
            drawPath();
            ctx.beginPath();
            ctx.strokeStyle = strokeStyle;
            var point = path[path.length - 1];
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            ctx.closePath();
            return; //(state == STATE.NEXT_POINT_DONE);
        }
        if (state == STATE.LAST_POINT) {
            var point = path[0];
            path.push({
                x: point.x,
                y: point.y
            });
            drawPath();
            $g.emit('save-poly', path);
            return (state = STATE.PATH_END);
        }
        if (state == STATE.PATH_END) {
            return drawPath();
        }
    }
    $g.once('$g.settings', (p) => {
        ctx = p.ctx;
    });
    return {
        configure: (p) => {
            strokeStyle = p.strokeStyle;
        },
        stop: () => STATE.DISABLED,
        listen: () => {
            $g.once('$g.settings', (p) => {
                mouse = $g.mouse;
                renderer = $g.renderer;
                if (!renderer) return console.warn('poly-editor call-init-first');
                if (state != STATE.POWER_OFF) return (state = STATE.POWER_ON);
                window.addEventListener('keyup', function(evt) {
                    if (evt.keyCode == 13) return (state = STATE.LAST_POINT);
                }, false);
                window.addEventListener('mousemove', function(evt) {

                }, false);
                window.addEventListener('mousedown', function(evt) {
                    if (![STATE.POWER_ON, STATE.NEXT_POINT_WAIT, STATE.NEXT_POINT_DONE].some(v => v == state)) return;
                    var button = evt.which || evt.button;
                    if (button == 1) {
                        if (state == STATE.POWER_ON) state = STATE.START_POINT_WAIT;
                        //if (state == STATE.POWER_ON) state = STATE.START_POINT_WAIT;
                        if (state == STATE.NEXT_POINT_DONE) state = STATE.NEXT_POINT_WAIT;
                        if (state == STATE.NEXT_POINT_WAIT) return; //draw pending
                    }
                }, false);
                renderer.register({
                    update: update
                });
                state = STATE.POWER_ON;
            });
        }
    };
})();