"use strict";

var canvas;
var fillColor = '#ffffff';
var strokeColor = '#ff0000';
var StrokeWidth = 1;
var drawMode = 'None';
var selecting = true;
var drawing = false;
var pts = [];
const numLinePts = 2;
const numTrianglePts = 3;
const numRectanglePts = 2;
const numCirclePts = 2;
const numCurvePts = 3;

// Initializer for fabric canvas
function init() {
    canvas = new fabric.Canvas('canvas', {
        width: 800,
        height: 550,
        backgroundColor: 'black'
    });

    // Fabric event handler for mousedown
    canvas.on('mouse:down', mouseDown);
}
init();

// Handle fabric mousedown events
function mouseDown(mousePos) {
    let x = mousePos.pointer.x;
    let y = mousePos.pointer.y;
    if (drawing && !selecting) {
        draw(x, y);
    }
}

// Connected to canvas mode drop down menu in html
// Set select or draw mode
function setSelection(mode) {
    if (mode.value == 'Draw') {
        selecting = false;
    } else {
        selecting = true;
        pts = [];
    }
}

// Connected to shapes dropdown menu in html
// Sets draw mode to chosen shape
function setDrawMode(mode) {
    drawMode = mode.value;
    if (drawMode == 'None') {
        drawing = false;
    } else {
        drawing = true;
    }
    // console.log(drawMode);
}

// Draw shape depending on drawmode
function draw(xPos, yPos) {
    // Add new point (x, y) to pts[]
    pts.push([xPos, yPos]);

    switch(drawMode){
        case 'Line':
            if (pts.length == numLinePts) {
                drawLine();
            }   
            break;
        case 'PolyLine':
            break;
        case 'Triangle':
            if (pts.length == numTrianglePts) {
                drawTriangle();
            }
            break;
        case 'Rectangle':
            if (pts.length == numRectanglePts) {
                drawRectangle();
            }
            break;
        case 'Polygon':
            break;
        case 'Circle':
            if (pts.length == numCirclePts) {
                drawCircle();
            }
            break;
        case 'Ellipse':
            if (pts.length == numCirclePts) {
                drawEllipse();
            }
            break;
        case 'Curve':
            if (pts.length == numCurvePts) {
                drawCurve();
            }
            break;
    }
}

function drawLine() {
    let line = new fabric.Line([pts[0][0], pts[0][1], pts[1][0], pts[1][1]], {
        stroke: strokeColor,
        strokeWidth: StrokeWidth
    });

    // "add" line onto canvas
    canvas.add(line);
    canvas.requestRenderAll();

    pts = [];
}
function drawTriangle() {
    let triangle = new fabric.Polygon([{x:pts[0][0], y:pts[0][1]}, {x:pts[1][0], y:pts[1][1]}, {x:pts[2][0], y:pts[2][1]}], {
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: StrokeWidth
    });

    // "add" triangle onto canvas
    canvas.add(triangle);
    canvas.requestRenderAll();

    pts = [];
}
function drawRectangle() {
    let rWidth = pts[1][0] - pts[0][0];
    let rHeight = pts[1][1] - pts[0][1];

    let rectangle = new fabric.Rect({
        left: pts[0][0],
        top: pts[0][1],
        width: rWidth,
        height: rHeight,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: StrokeWidth
    });

    // "add" rectangle onto canvas
    canvas.add(rectangle);
    canvas.requestRenderAll();

    pts = [];
}
function drawCircle() {
    // Math to find radius of circle given two points
    var outerX = pts[0][0] - pts[1][0];
    var outerY = pts[0][1] - pts[1][1];
    var rad = Math.sqrt(outerX*outerX + outerY*outerY);

    let circle = new fabric.Circle({
        originX: 'center',
        originY: 'center',
        left: pts[0][0],
        top: pts[0][1],
        radius: rad,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: StrokeWidth
    });

    // "add" circle onto canvas
    canvas.add(circle);
    canvas.requestRenderAll();

    pts = [];
}
function drawEllipse() {
    let Rx = Math.abs(pts[0][0] - pts[1][0])/2;
    let Ry = Math.abs(pts[0][1] - pts[1][1])/2;

    let ellipse = new fabric.Ellipse({
        originX: 'center',
        originY: 'center',
        left: pts[0][0],
        top: pts[0][1],
        rx: Rx,
        ry: Ry,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: StrokeWidth
    });

    // "add" ellipse onto canvas
    canvas.add(ellipse);
    canvas.requestRenderAll();

    pts = [];
}
function drawCurve() {

    // // "add" curve onto canvas
    // canvas.add(curve);
    // canvas.requestRenderAll();

    // pts = [];
}

// Set fill color for new shapes
function setColor(newColor) {
    fillColor = newColor.value;
}
// Set stroke color for new shapes
function setStrokeColor(newStrokeColor) {
    strokeColor = newStrokeColor.value;
}
// Set stroke width for new shapes
function setStrokeWidth(newStrokeWidth) {
    StrokeWidth = parseFloat(newStrokeWidth.value);
}