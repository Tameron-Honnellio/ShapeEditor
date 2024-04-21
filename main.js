"use strict";

var canvas;
const canvasHeight = window.innerHeight;
const canvasWidth = window.innerWidth;
const canvasBackgroundColor = '#000000';
var fillColor = '#000000';
var strokeColor = '#ffffff';
var StrokeWidth = 2;
var selecting = true;
var drawing = false;
var drawMode = 'None';
var pts = [];
var undoBuffer = [];
var keyBuffer = [];
var enableGrid = false;
var snapToGrid = false;
var grid;
const gridWidth = canvasWidth;
const gridHeight = canvasHeight;
const gridSize = 20;
const gridColor = '#828282';
var polyCount = 5;
const numLinePts = 2;
const numTrianglePts = 3;
const numRectanglePts = 2;
const numCirclePts = 2;
const numCurvePts = 4;

// Initializer for fabric canvas
function init() {
    // Initialize new fabric canvas
    canvas = new fabric.Canvas('canvas', {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: canvasBackgroundColor
    });

    // Fabric event handler for mousedown
    canvas.on('mouse:down', mouseDown);
    // Fabric event handler for object move
    canvas.on('object:moving', objectMoving);
    // Event listener for keydown event
    window.addEventListener("keydown", keyboardInput);

    // Initialize grid but don't draw it
    initGrid();
}
init();

// Handle fabric mousedown events
function mouseDown(mousePos) {
    // Get x and y position of mouse down
    let x = mousePos.pointer.x;
    let y = mousePos.pointer.y;
    if (drawing && !selecting) {
        draw(x, y);
    }
}
// Handle fabric object move events
function objectMoving(object) {
    // Handle snap to grid
    if (snapToGrid && enableGrid) {
        // Set selected object's origin (left, top) to grid intervals 
        object.target.set({
            left: Math.ceil(object.target.left / gridSize) * gridSize,
            top: Math.ceil(object.target.top / gridSize) * gridSize
        });
    }
    canvas.requestRenderAll();
}
// Handle keyboard input
function keyboardInput(keyEvent) {
    // Add pressed key to keybuffer
    let key = keyEvent.keyCode;
    keyBuffer.push(key);

    // If key pressed was ctrl+c -> copy
    if (keyBuffer[0] == 17 && keyBuffer[1] == 67) {
        copy();
        keyBuffer = [];
    // If key pressed was ctrl+v -> paste
    } else if (keyBuffer[0] == 17 && keyBuffer[1] == 86) {
        paste();
        keyBuffer = [];
    }
    // Reset key buffer
    if (keyBuffer.length > 2) {
        keyBuffer = [];
    }
}

// Connected to canvas mode drop down menu in html
// Set select or draw mode
function setSelection(mode) {
    if (mode.value == 'Draw') {
        selecting = false;
    } else {
        selecting = true;
        // If selecting, reset draw points
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

// Draw shape depending on drawmode, called from mousedown event
function draw(xPos, yPos) {
    // Add new point to pts list: mousedown(x, y)
    pts.push([xPos, yPos]);

    switch(drawMode){
        case 'Line':
            if (pts.length == numLinePts) {
                drawLine();
            }   
            break;
        case 'PolyLine':
            if (pts.length == polyCount) {
                drawPolyLine();
            }
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
            if (pts.length == polyCount) {
                drawPolygon();
            }
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
function drawPolyLine() {
    var polyLinePoints = [];
    for (var i = 0; i < pts.length; i++) {
        polyLinePoints.push({
            x: pts[i][0],
            y: pts[i][1]
        });
    }

    let polyLine = new fabric.Polyline(polyLinePoints, {
        fill: false,
        stroke: strokeColor,
        strokeWidth: StrokeWidth
    });

    // add polyline to canvas
    canvas.add(polyLine);
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
function drawPolygon() {
    var polygonPoints = [];
    for (var i = 0; i < pts.length; i++) {
        polygonPoints.push({
            x: pts[i][0],
            y: pts[i][1]
        });
    }

    let polygon = new fabric.Polygon(polygonPoints, {
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: StrokeWidth
    });

    // add polygon to canvas
    canvas.add(polygon);
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
// Cubic Bezier Curve
function drawCurve() {
    let pathName = "M " + pts[0][0] + "," + pts[0][1] + " C " + pts[1][0] + "," + pts[1][1] + " " + pts[2][0] + "," + pts[2][1] + " " + pts[3][0] + "," + pts[3][1];

    let curve = new fabric.Path(pathName, {
        fill: false,
        stroke: strokeColor,
        strokeWidth: StrokeWidth
    });

    // "add" curve onto canvas
    canvas.add(curve);
    canvas.requestRenderAll();

    pts = [];
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
// Set number of points for polyline and polygon
function setPolyCount(newPolyCount) {
    polyCount = parseInt(newPolyCount.value);
}

function clearCanvas() {
    // TODO: add objects to redo buffer
    // Clear canvas
    canvas.clear();
    // Reset canvas backgroundcolor
    canvas.set({
        backgroundColor: canvasBackgroundColor
    });
    // If grid was enabled, redraw it
    if (enableGrid) {
        canvas.add(grid);
    }
}

function toggleGrid() {
    enableGrid = !enableGrid;
    // add or remove grid from canvas
    if (enableGrid) {
        canvas.add(grid);
        canvas.sendToBack(grid);
    } else {
        canvas.remove(grid);
    }

    canvas.requestRenderAll();
}
function initGrid() {
    // initialize grid
    let gridLines = [];
    // options for each line
    let lineOptions = {
        stroke: gridColor,
        strokeWidth: StrokeWidth,
        selectable: false
    };
    // create vertical lines
    for (let i = Math.ceil(gridWidth / gridSize); i--;) {
        gridLines.push(new fabric.Line([gridSize * i, 0, gridSize * i, gridHeight], lineOptions));
    }
    // create horizontal lines
    for (let i = Math.ceil(gridHeight / gridSize); i--;) {
        gridLines.push(new fabric.Line([0, gridSize * i, gridWidth, gridSize * i], lineOptions));
    }

    grid = new fabric.Group(gridLines, {
        left: 0,
        top: 0,
        selectable: false
    });
    grid.hoverCursor = 'default';
}
function toggleSnapToGrid() {
    snapToGrid = !snapToGrid;
}

function copy() {
    console.log("Copy detected!!!");
}
function paste() {
    console.log("Paste detected!!!");
}