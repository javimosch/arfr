var mpixi = {};

mpixi.init = function() {
    console.log('mpixi init');

    var renderer = new PIXI.WebGLRenderer(800, 600);
    document.body.appendChild(renderer.view);
    var stage = new PIXI.Container()
    var rectangle = new PIXI.Graphics();
    rectangle.lineStyle(4, 0xFF3300, 1);
    rectangle.beginFill('red');
    rectangle.drawRect(0, 0, window.screen.width, window.screen.height);
    rectangle.endFill();
    rectangle.x = window.screen.width/2;
    rectangle.y = window.screen.height/2;
    stage.addChild(rectangle);
    
    animate(renderer,stage);
};

function animate(r,stage) {
    requestAnimationFrame(function(){
        animate(r,stage)
    });
    r.render(stage);
}