"use strict";

var canvas;
var canvasState;
const canvasHeight = window.innerHeight;
const canvasWidth = window.innerWidth;
const canvasBackgroundColor = '#000000';
var fillColor = '#000000';
var strokeColor = '#ffffff';
var StrokeWidth = 2;
var selecting = true;
var drawing = false;
var drawMode = 'None';
var interactMode = 'None';
var panning = false;
var userString;
var pts = [];
var undoBuffer = [];
var redoBuffer = [];
var keyBuffer = [];
var enableGrid = false;
var snapToGrid = false;
var grid;
var clipboard;
const gridWidth = canvasWidth;
const gridHeight = canvasHeight;
const gridSize = 20;
const gridColor = '#828282';
const filename = "canvas.json";
const jpegFilename = "canvas.jpg";
var polyCount = 5;
const numLinePts = 2;
const numTrianglePts = 3;
const numRectanglePts = 2;
const numCirclePts = 2;
const numCurvePts = 4;
var x;
var y;
var relX;
var relY;

// Initializer for fabric canvas
function init() {
    // Initialize new fabric canvas
    canvas = new fabric.Canvas('canvas', {
        width: canvasWidth,
        height: canvasHeight,
        fireRightClick: true,
        stopContextMenu: true,
        backgroundColor: canvasBackgroundColor
    });

    canvas.preserveObjectStacking = true;

    // Fabric event handler for mouse events
    canvas.on('mouse:down', mouseDown);
    canvas.on('mouse:up', mouseUp);
    canvas.on('mouse:move', mouseMove);
    canvas.on('mouse:wheel', mouseWheel);
    // Fabric event handler for path created (used during brush draw)
    canvas.on('path:created', pathCreated);
    // Fabric event handler for object move
    canvas.on('object:moving', objectMoving);
    // Save canvas state
    saveState();
    // Event listener for keydown event
    window.addEventListener("keydown", keyboardInput);
    // Event listener for load json file input
    document.getElementById("loadJSON").addEventListener("change", loadJSON);
    // Event listener for upload png
    document.getElementById("uploadPng").addEventListener("change", loadPNG);

    // Initialize grid but don't draw it
    initGrid();
}
init();

// Handle fabric mousedown events
function mouseDown(mousePos) {
    // Get x and y position of mouse down
    x = mousePos.pointer.x;
    y = mousePos.pointer.y;
    relX = mousePos.pointer.x;
    relY = mousePos.pointer.y;
    // If user wants to draw, and isn't selecting
    if (drawing && !selecting) {
        draw(x, y);
    }
    // If free draw is enabled, free draw
    if (canvas.isDrawingMode) {
        freeDraw();
    }
    if (interactMode == 'Pan' || mousePos.button == 3) {
        panning = true;
    }
}
function mouseUp(mouseEvent) {
    if (interactMode == 'Pan' && panning) {
        panning = false;
    }
    if (mouseEvent.button == 3) {
        panning = false;
    }
}
function mouseMove(mousePos) {
    if (panning) {
        pan(mousePos);
    }
}
function mouseWheel(event) {
    zoom(event);
}
function pathCreated(event) {
    // Instantiate path as object, this is called after mouseup during brush mode
    // event.path.set();
    var newPathObj = event.path;
    newPathObj.selectable = false;
    canvas.add(newPathObj);
    canvas.requestRenderAll();
    saveState();
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
    // Save canvas state
    saveState();
}
// Handle keyboard input events
function keyboardInput(keyEvent) {
    // Add pressed key to keybuffer
    let key = keyEvent.keyCode;
    keyBuffer.push(key);

    if (keyBuffer[1] == 67 && keyBuffer[0] == 17) {
        // If key pressed was ctrl+c -> copy
        copy();
        keyBuffer = [];
    } else if (keyBuffer[1] == 86 && keyBuffer[0] == 17) {
        // If key pressed was ctrl+v -> paste
        paste();
        keyBuffer = [];
    } else if (keyBuffer[1] == 90 && keyBuffer[0] == 17) {
        // If key pressed was ctrl+z -> undo
        undo();
        keyBuffer = [];
    } else if (keyBuffer[1] == 89 && keyBuffer[0] == 17) {
        // If key pressed was ctrl+y -> redo
        redo();
        keyBuffer = [];
    }
    // Reset key buffer
    if (keyBuffer.length > 2) {
        keyBuffer = [];
    }
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
        case 'Text':
            if (userString && (pts.length == 1)) {
                drawText();
            }
            break;
    }

    // Save canvas state
    saveState();
}

function drawLine() {
    let line = new fabric.Line([pts[0][0], pts[0][1], pts[1][0], pts[1][1]], {
        stroke: strokeColor,
        strokeWidth: StrokeWidth,
        selectable: false,
        hoverCursor: 'default'
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
        strokeWidth: StrokeWidth,
        selectable: false,
        hoverCursor: 'default'
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
        strokeWidth: StrokeWidth,
        selectable: false,
        hoverCursor: 'default'
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
        strokeWidth: StrokeWidth,
        selectable: false,
        hoverCursor: 'default'
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
        strokeWidth: StrokeWidth,
        selectable: false,
        hoverCursor: 'default'
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
        strokeWidth: StrokeWidth,
        selectable: false,
        hoverCursor: 'default'
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
        strokeWidth: StrokeWidth,
        selectable: false,
        hoverCursor: 'default'
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
        strokeWidth: StrokeWidth,
        selectable: false,
        hoverCursor: 'default'
    });

    // "add" curve onto canvas
    canvas.add(curve);
    canvas.requestRenderAll();

    pts = [];
}
function drawText() {
    let text = new fabric.Text(userString, {
        originX: 'center',
        originY: 'center',
        left: pts[0][0],
        top: pts[0][1],
        fill: fillColor,
        selectable: false,
        hoverCursor: 'default'
    });

    // add text onto canvas
    canvas.add(text);
    canvas.requestRenderAll();

    pts = [];
}
function freeDraw() {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.color = strokeColor;
    canvas.freeDrawingBrush.width = StrokeWidth;
}

// Connected to canvas mode drop down menu in html
// Set select or draw mode
function setSelection(mode) {
    if (mode.value == 'Draw') {
        selecting = false;
        interactMode = 'None';
    } else if (mode.value == 'Pan') {
        interactMode = 'Pan';
        selecting = false;
        drawing = false;
        canvas.isDrawingMode = false;
        pts = [];
    } else if (mode.value == 'Zoom') {
        interactMode = 'Zoom';
        selecting = false;
        drawing = false;
        canvas.isDrawingMode = false;
        pts = [];
    }else {
        selecting = true;
        drawing = false;
        canvas.isDrawingMode = false;
        interactMode = 'None';
        // If selecting, reset draw points
        pts = [];
        // Set canvas selection to true
        canvas.forEachObject(function(obj){
            obj.selectable = true;
            obj.hoverCursor = 'pointer';
        });
    }
    // If the canvas mode is not selection
    if (!selecting) {
        // Set canvas selection to false
        canvas.forEachObject(function(obj){
            obj.selectable = false;
            obj.hoverCursor = 'default';
        });
    }

    canvas.requestRenderAll();
    saveState();
}
// Connected to shapes dropdown menu in html
// Sets draw mode to chosen shape
function setDrawMode(mode) {
    drawMode = mode.value;
    if (drawMode == 'None') {
        drawing = false;
        canvas.isDrawingMode = false;
    } else if (drawMode == 'Brush') {
        drawing = false;
        canvas.isDrawingMode = true;
    } else {
        drawing = true;
        canvas.isDrawingMode = false;
    }
    // console.log(drawMode);
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
function setUserText(newText) {
    userString = newText.value;
}

function clearCanvas() {
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
    // Save canvas state
    saveState();
}
function saveAsJSON() {
    // Remove grid
    canvas.remove(grid);
    // Stringify canvas as json
    let jsonString = JSON.stringify(canvas);
    // Pass json into a blob to create an object url
    let blob = new Blob([jsonString], {type: "text/plain"});
    let jsonURL = URL.createObjectURL(blob);
    // Get anchor element from html
    // Set href to object url
    // Set download to file name
    let anchor = document.getElementById("downloadAnchor");
    anchor.href = jsonURL;
    anchor.download = filename;
    // Click anchor to download file
    anchor.click();
    // Free reference to object url
    URL.revokeObjectURL(jsonURL);
}
function loadJSON(fileEvent) {
    let readFile = new FileReader();
    readFile.onload = onLoadJSON;
    readFile.readAsText(fileEvent.target.files[0]);
}
function onLoadJSON(fileEvent) {
    // Parse string into json
    let jsonFile = JSON.parse(fileEvent.target.result);
    canvas.clear();
    // Load json file, render canvas
    canvas.loadFromJSON(jsonFile, canvas.requestRenderAll.bind(canvas));
    // Save canvas state
    saveState();
}
function loadPNG(fileEvent) {
    var objURL = URL.createObjectURL(fileEvent.target.files[0]);

    fabric.Image.fromURL(objURL, function(image){
        image.scale(0.5);
        canvas.add(image);
    });

    canvas.requestRenderAll();
    saveState();
}
function saveAsJPEG() {
    // Get anchor element from html
    let anchor = document.getElementById('jpegAnchor');
    // Create object url from canvas
    let urlString = canvas.toDataURL({
        format: 'jpeg',
        quality: 1.0,
    });
    // Set anchor href to object url
    anchor.href = urlString;
    // Set download to jpg filename
    anchor.download = jpegFilename;
    // Click anchor to download file
    anchor.click();
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
    // Save canvas state
    saveState();
}
function initGrid() {
    // initialize gridlines
    let gridLines = [];
    // options for each line
    let lineOptions = {
        stroke: gridColor,
        strokeWidth: StrokeWidth,
        selectable: false
    };
    // create vertical gridlines
    for (let i = Math.ceil(gridWidth / gridSize); i--;) {
        gridLines.push(new fabric.Line([gridSize * i, 0, gridSize * i, gridHeight], lineOptions));
    }
    // create horizontal gridlines
    for (let i = Math.ceil(gridHeight / gridSize); i--;) {
        gridLines.push(new fabric.Line([0, gridSize * i, gridWidth, gridSize * i], lineOptions));
    }
    // Create unselectable group to contain all gridlines in one object
    grid = new fabric.Group(gridLines, {
        left: 0,
        top: 0,
        selectable: false
    });
    // Change cursor to default when hovering over grid
    grid.hoverCursor = 'default';
}
function toggleSnapToGrid() {
    snapToGrid = !snapToGrid;
}

// Code for copy() and paste() adapted from http://fabricjs.com/copypaste
function copy() {
    // Copy selected object to clipboard
    canvas.getActiveObject().clone(function(cloned) {
        clipboard = cloned;
    });
}
function paste() {
    // Clone clipboard object to support multiple pastes with original copy
    clipboard.clone(function(clonedObj) {
        // Deselect copied object
        canvas.discardActiveObject();
        // Add position offset to cloned object (so it isn't pasted directly on top of original)
        // Set to evented to allow canvas events to effect cloned object
        clonedObj.set({
            left: clonedObj.left + 10,
            top: clonedObj.top + 10,
            evented: true
        });
        // If original copy contained multiple objects
        if (clonedObj.type == 'activeSelection') {
            // active selection needs a reference to the canvas
            clonedObj.canvas = canvas;
            // Paste each cloned object in original copy to canvas
            clonedObj.forEachObject(function(obj) {
                canvas.add(obj);
            });
            // Fixes unselectability
            clonedObj.setCoords();
        } else {
            // If original copy contained one object
            // Paste cloned object to canvas
            canvas.add(clonedObj);
        }
        // Add aditional offset to initial copied object to account for multiple pastes
        clipboard.top += 10;
        clipboard.left += 10;
        // Select pasted object
        canvas.setActiveObject(clonedObj);
        canvas.requestRenderAll();
        // Save canvas state
        saveState();
    });

}

function saveState() {
    // reset redo buffer
    redoBuffer = [];
    // If there is a current canvas state
    if (canvasState) {
        // Push it to undo buffer
        undoBuffer.push(canvasState);
    }
    // Save current canvas state
    canvasState = JSON.stringify(canvas);
}
function undo() {
    resetState(undoBuffer, redoBuffer);
}
function redo() {
    resetState(redoBuffer, undoBuffer);
}
function resetState(prevBuffer, toBuffer) {
    // Set current state to toBuffer
    toBuffer.push(canvasState);
    // Retrieve previous state from prevBuffer
    canvasState = prevBuffer.pop();
    // Clear canvas
    canvas.clear();
    // Load canvas state into canvas and render
    canvas.loadFromJSON(canvasState, canvas.requestRenderAll.bind(canvas));

}
function pan(mousePos) {
    // Mouse move event pos
    let newX = mousePos.pointer.x;
    let newY = mousePos.pointer.y;
    // Pan the canvas relative to previous mouse position
    canvas.relativePan({x: newX - relX, y: newY - relY});
    // Update previous mouse position
    relX = newX;
    relY = newY;
}
function zoom(event) {
    // Get amount scroll wheel rotatated
    var delta = event.e.deltaY;
    // Get canvas zoom value
    var zoom = canvas.getZoom();
    // update zoom according to delta
    zoom *= 0.999 ** delta;
    // Hard lock zoom between 20, and 0.01
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    // Set canvas zoom
    // canvas.setZoom(zoom);
    canvas.zoomToPoint({x: event.e.offsetX , y: event.e.offsetY}, zoom);
    event.e.preventDefault();
    event.e.stopPropagation();
}