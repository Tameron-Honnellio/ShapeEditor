# ShapeEditor
 COMP Graphics Final - Shape Editor Using Canvas & FabricJS

 Tools:
 - FabricJS : http://fabricjs.com/
    - Free Library for Canvas Drawing and Management

How to Run:
- Download Repository: https://github.com/Tameron-Honnellio/ShapeEditor
- Open "ShapeEditor.html" With Browser (Chrome)

To Use:
- To Draw: 
    - Select Canvas Mode -> Draw
    - Select Shapes -> Desired Shape Object
    - Left Click on Canvas Repeatedly Until Shape is Drawn
- To Select: 
    - Select Canvas Mode -> Select

Shortcuts:
- Right Click -> Pan
- Mouse Wheel -> Zoom to Cursor
- C -> (on selected object) Copy
- V -> Paste
- Z -> Undo
- Y -> Redo
- Delete -> Clear Canvas
- B -> Activate Brush
- G -> Toggle Grid
- H -> Toggle Snap to Grid
- S -> Save Canvas as .jpg
- J -> Save Canvas as .json
- L -> Load Canvas from .json
- U -> Upload Image to Canvas

What Is?
- Fill Color: Determines color inside bounds of Shape and changes Text color
- Stroke Color: Determines outline color of Shape and line color for line based objects (line, polyline, curve, brush)
- Stroke Width: Determines line thickness for objects, and line based objects
- Poly Count: Determines number of points required to draw for poly based objects (polyline, polygon)

Bug Help:
- If adding select, or drawing operations don't work:
    - Swap off and on current canvas mode
    - (if drawing) Swap off and on desired Shape
    - (if selecting) Set Shapes -> None
    - Try to draw / select again

Sources of Help:
http://fabricjs.com/fabric-intro-part-1
http://fabricjs.com/docs/index.html
http://fabricjs.com/copypaste
https://www.youtube.com/watch?v=qisBBCae7iE