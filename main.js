var canvas;
var drawMode = 'None';
var color = '#ffffff';
var rect;

function init() {
    canvas = new fabric.Canvas('canvas', {
        width: 800,
        height: 500,
        backgroundColor: 'black'
    });

    // create a rectangle object
    rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: color,
        width: 20,
        height: 20
    });
  
    // "add" rectangle onto canvas
    canvas.add(rect);
}
init();

function setDrawMode(mode) {
    drawMode = mode.value;
    console.log(drawMode);
}
function setColor(newColor) {
    color = newColor.value;
    console.log(color);
    rect.set('fill', color);
}