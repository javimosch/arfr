/*global $g*/
$g.map = (()=>{
    var self = {},ctx, c;
    self.update = ()=>{
        
    };
    $g.once('$g.settings',(p)=>{
        ctx  = p.ctx;
        c = p.canvas;
    });
    $g.renderer.register(self);
    return self;
})();