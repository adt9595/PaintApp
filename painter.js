var colourDict={
	0: '#ffffff', // White
	1: '#000000', // Black
	2: '#b84248', // Light Red
	3: '#73272b', // Dark Red
	4: '#5a9acc', // Light Blue
	5: '#2d506b', // Dark Blue
	6: '#3dc475', // Light Green
	7: '#1e5e39' // Dark Green
}

var brushDict={
	0: 'round',
	1: 'square',
	2: 'butt'
}

var canvases, contexts;
var currentCanvas, currentContext;
var brushCanvas, brushContext;

window.addEventListener('load',() =>{
	// Get canvases
	canvases = [document.querySelector('#layer1'),
				document.querySelector('#layer2'),
				document.querySelector('#layer3')];
	brushCanvas = document.querySelector('#brushCanvas');
	currentCanvas = canvases[0];
	for(i=0;i<canvases.length;i++){
		canvases[i].style.opacity = 1.0;
	}
	let numLayers = canvases.length;

	// Get contexts
	contexts = [canvases[0].getContext('2d'),
				canvases[1].getContext('2d'),
				canvases[2].getContext('2d')]
	brushContext = brushCanvas.getContext('2d');
	currentContext = contexts[0];

	var currentColour = document.getElementById('currentColour');

	const inputColour = document.getElementsByClassName('inputColour')[0];
	inputColour.addEventListener('input',colourUpdate);

	const colourButtons = document.querySelectorAll('div.colour');
	const layerButtons = document.querySelectorAll('div.layerSelector');
	const brushButtons = document.querySelectorAll('div.brushStyleSelector');
	let numColours = colourButtons.length;

	const clearButton = document.getElementById('clearButton');
	clearButton.addEventListener('click',clearCanvas);

	const opacitySlider = document.getElementById('opacity');
	opacitySlider.addEventListener('input',setOpacity);
	opacitySlider.value = 1.0;
	
	const shapeButtons = document.querySelectorAll('div.shape');
	let numShapes = shapeButtons.length;

	// const rectButton = document.getElementById('rectangle');
	// rectButton.addEventListener('click',toggleRectangle);

	const brush = document.getElementById('brush');
	
	let currentShape = -1;
	let isDrawing = false;
	let isDrawingShape = false;
	let isErasing = false;
	let shapeStartingPosition;
	let mousedown = false;


	// Add colour button listeners
	for(i=0;i<numColours;i++){
		(function(){
			var self = colourButtons[i];
			var tmpColour = colourDict[i];
			self.style.backgroundColor = tmpColour;
			colourButtons[i].addEventListener('click',function(){
				setColour(tmpColour);
			});
		}());
	}

	for(i=0;i<numLayers;i++){
		// Add layer button listeners
		(function(){
			var index = i;
			layerButtons[i].addEventListener('click',function(){
				changeContext(index);
			});
		}());

		// Add brush style button listeners
		(function(){
			var index = i;
			brushButtons[i].addEventListener('click',function(){
				changeBrushStyle(index);
			});
		}());

		// Set default sizes
		canvases[i].height = window.innerHeight;
		canvases[i].width = window.innerWidth;
	}

	// Add shape button listeners
	for(i=0;i<numShapes;i++){
		(function(){
			var index = i;
			shapeButtons[i].addEventListener('click',function(){
				changeShape(index);
			});
		}());
	}

	currentContext.lineWidth = 10;
	let brushSize = currentContext.lineWidth;
	let brushColour = '#000000';
	let brushStyle = 'round';
	currentContext.lineCap = brushStyle;
	brushCanvas.height = canvases[0].height;
	brushCanvas.width = canvases[0].width;

	function colourUpdate(){
		brushColour = inputColour.value;
		brushContext.fillStyle = brushColour;
		currentColour.style.backgroundColor = brushColour;
	}

	function beginDraw(){
		brushColour = document.getElementsByClassName('inputColour')[0].value;
		isDrawing = true;
	}

	function beginErase(){
		isErasing = true;
	}

	function endDraw(){
		isDrawing = false;
		currentContext.beginPath();
	}

	function endErase(){
		isErasing = false;
		currentContext.beginPath();
	}

	function draw(e){
		drawBrush(e);
		if(!isDrawing && !isErasing){
			return;
		}
		if(isErasing){
			erase(e);
			return;
		}
		computeDraw(e,currentContext,brushColour);		
	}

	function drawBrush(e){
		brushContext.clearRect(0, 0, brushCanvas.width, brushCanvas.height);
		//colourUpdate();
		computeDrawBrush(e);
	}

	function computeDrawBrush(e){
		brushContext.lineWidth = brushSize;
		brushContext.lineCap = brushStyle;
		brushContext.moveTo(getMousePos(e)[0],getMousePos(e)[1]);
		brushContext.strokeStyle = brushColour;
		brushContext.beginPath()
		brushContext.lineTo(getMousePos(e)[0],getMousePos(e)[1]);
		brushContext.stroke();
	}

	function computeDraw(e,ctx,colour){
		ctx.lineWidth = brushSize;
		ctx.lineCap = brushStyle;
		ctx.lineTo(getMousePos(e)[0],getMousePos(e)[1]);
		ctx.strokeStyle = colour;
		if(getMousePos(e)[0] >= 0){
			ctx.stroke();
		}
		
		ctx.beginPath();
		ctx.moveTo(getMousePos(e)[0],getMousePos(e)[1]);
	}

	function toggleRectangle(){
		isDrawingRectangle = isDrawingRectangle ? false : true;
	}

	function changeShape(index){
		if(index >= 0){
			setActive(shapeButtons,index);
		}
		else{
			clearActive(shapeButtons);
		}
		currentShape = index;
	}

	function drawShape(e, ctx, shapeIndex){
		brushContext.clearRect(0,0,brushCanvas.width,brushCanvas.height);
		ctx.lineWidth = brushSize;
		ctx.strokeStyle = brushColour;
		switch(shapeIndex){
			case 0:
				drawLine(e,ctx);
				break;
			case 1:
				drawRectangle(e,ctx);
				break;
			case 2:
				drawIsoTriangle(e,ctx);
				break;
		}
	}

	function drawLine(e,ctx){
		ctx.lineCap = currentContext.lineCap;
		let mousePos = getMousePos(e);
		ctx.beginPath();
		ctx.moveTo(shapeStartingPosition[0],shapeStartingPosition[1]);
		ctx.lineTo(mousePos[0],mousePos[1]);
		ctx.stroke();
	}

	function drawRectangle(e,ctx){
		ctx.lineCap = 'square';
		let mousePos = getMousePos(e);
		ctx.beginPath();
		ctx.moveTo(shapeStartingPosition[0],shapeStartingPosition[1]);
		ctx.lineTo(shapeStartingPosition[0],mousePos[1]);
		ctx.stroke();
		ctx.lineTo(mousePos[0],mousePos[1]);
		ctx.stroke();
		ctx.lineTo(mousePos[0],shapeStartingPosition[1]);
		ctx.stroke();
		ctx.lineTo(shapeStartingPosition[0],shapeStartingPosition[1]);
		ctx.stroke();
		// brushContext.beginPath();
	}

	function drawIsoTriangle(e,ctx){
		ctx.lineCap = 'round';
		let mousePos = getMousePos(e);
		ctx.beginPath();
		ctx.moveTo(shapeStartingPosition[0],shapeStartingPosition[1]);
		ctx.lineTo(mousePos[0],mousePos[1]);
		ctx.stroke();
		ctx.lineTo(mousePos[0]-2*(mousePos[0]-shapeStartingPosition[0]),mousePos[1]);
		ctx.stroke();
		ctx.lineTo(shapeStartingPosition[0],shapeStartingPosition[1]);
		ctx.stroke();
	}

	function erase(e){
		isDrawing = false;
		computeDraw(e,currentContext,'#ffffff');
	}

	function changeSize(e){
		if(e.deltaY > 0 && brushSize > 2){
			brushSize -= 2;
		}
		else if(e.deltaY < 0 && brushSize < 250){
			brushSize += 2;
		}
		if(!isDrawingShape){
			drawBrush(e)
		}
		else{
			drawShape(e, brushContext,currentShape);
		}
		
	}

	function setColour(col){
		document.getElementsByClassName('inputColour')[0].value = col;
		brushColour = col;
		colourUpdate();
	}

	function clearCanvas(){
		currentContext.clearRect(0, 0, brushCanvas.width, brushCanvas.height);
	}

	function rgbToHex(r,g,b){
		return "#" + colToHex(r) + colToHex(g) + colToHex(b);
	}

	function colToHex(c) {
		var hex = c.toString(16);
	    if(hex.length == 1){
	    	return '0' + hex;
	    }
	    return hex;
	}

	function hexToRgb(hex) {
	    var bigint = parseInt(hex, 16);
	    var r = (bigint >> 16) & 255;
	    var g = (bigint >> 8) & 255;
	    var b = bigint & 255;
	    return [r,g,b];
	}

	function changeContext(index){
		setActive(layerButtons,index);

		currentContext = contexts[index];
		currentCanvas = canvases[index];
		opacitySlider.value = currentCanvas.style.opacity;
		brushCanvas.style.zIndex = -2*index + 6;
		brushCanvas.style.opacity = currentCanvas.style.opacity;
	}

	function setActive(elements,index){
		if(!elements[index].classList.contains('active')){
			elements[index].className += " active";
		}
		for(i=0;i<elements.length;i++){
			if(i === index){
				continue;
			}
			if(elements[i].classList.contains('active')){
				elements[i].className = elements[i].className.replace(" active","");
			}
		}
	}

	function clearActive(elements){
		for(i=0;i<elements.length;i++){
			if(elements[i].classList.contains('active')){
				elements[i].className = elements[i].className.replace(" active","");
			}
		}
	}

	function changeBrushStyle(index){
		setActive(brushButtons,index);
		brushStyle = brushDict[index];
		currentContext.lineCap = brushStyle;
	}

	function getMousePos(e) {
        var rect = brushCanvas.getBoundingClientRect();
        return [(e.clientX - rect.left)/(rect.right-rect.left)*brushCanvas.width,
        		(e.clientY - rect.top)/(rect.bottom-rect.top)*brushCanvas.height];
  	}

  	function setOpacity(){
  		currentCanvas.style.opacity = opacitySlider.value;
  		brushCanvas.style.opacity = currentCanvas.style.opacity;
  	}

  	// Disable context menu on right-click
  	document.oncontextmenu = function() {
	    return false;
	}

	// Window event listeners
  	window.addEventListener('resize',() =>{
		for(i=0;i<numLayers;i++){
			canvases[i].height = window.innerHeight;
			canvases[i].width = window.innerWidth;
		}
		// canvas.height = window.innerHeight - heightOffset;
		// canvas.width = window.innerWidth - widthOffset;
		brushCanvas.height = canvases[0].height;
		brushCanvas.width = canvases[0].width;
		colourUpdate();
	})

	window.addEventListener('mousemove',function(e){
		if(currentShape >= 0 && mousedown){
			drawShape(e,brushContext,currentShape);
		}
		else{
			draw(e);
		}
	});

	window.addEventListener('mousedown',function(e){
		if(getMousePos(e)[0] < 0){
			return;
		}
		switch(e.button){
			case 0:
				mousedown = true;
				if(currentShape >= 0){
					shapeStartingPosition = getMousePos(e);
					drawShape(e,brushContext,currentShape);
					isDrawingShape = true;
				}
				beginDraw();
				break;
			case 2:
				beginErase();
				break;
		}
	})

	window.addEventListener('mouseup',function(e){
		switch(e.button){
			case 0:
				if(mousedown === true){
					mousedown = false;
					if(currentShape >= 0){
						drawShape(e,currentContext,currentShape);
						brushContext.moveTo(getMousePos(e)[0],getMousePos(e)[1])
						changeShape(-1); // Return to brush
						isDrawingShape = false;
					}
				}
				endDraw();
				break;
			case 2:
				endErase();
				break;
		}
	});

	window.addEventListener('wheel',changeSize);
	
	colourUpdate();
})



