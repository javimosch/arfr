/*global $g*/
$g.utils = (()=>{
    function writeMessage(canvas, message,color) {
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = '18pt Calibri';
        context.fillStyle = color || 'black';
        context.fillText(message, 10, 25);
    }
    return {
        writeMessage:writeMessage
    };
})();