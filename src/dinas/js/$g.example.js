//r.$emit = (n, p) => $g.emit(n, p);
//r.$on = (n, h) => $g.on(n, h);

$g.polyEditor.configure({
    strokeStyle: 'black'
});

$g.mouse.listen(c);
$g.polyEditor.listen();


$g.run({
    canvas: document.getElementById('myCanvas'),
    fillStyle: 'black'
});

window.c = c;
window.ctx = ctx;