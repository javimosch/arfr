/*global $g*/
$g.mouse = (() => {
    var ctx, c;

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
    $g.once('$g.settings', (p) => {
        ctx = p.ctx;
        c = p.canvas;
    });
    var o = {
        x: 0,
        y: 0,
        listen: () => {
            $g.once('$g.settings', (p) => {
                c.addEventListener('mousemove', function(evt) {
                    var pos = getMousePos(c, evt);
                    o.x = pos.x;
                    o.y = pos.y;
                }, false);
            });
        }
    };
    return o;
})();