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

window.addEventListener('load',() =>{
	// Get canvases
	var canvases = [document.querySelector('#layer1'),
					document.querySelector('#layer2'),
					document.querySelector('#layer3')];
	const brushCanvas = document.querySelector('#brushCanvas');

	// Get contexts
	var contexts = [canvases[0].getContext('2d'),
					canvases[1].getContext('2d'),
					canvases[2].getContext('2d')]
	const brushContext = brushCanvas.getContext('2d');
	var currentContext = contexts[0];

	const inputColour = document.getElementsByClassName('inputColour')[0];
	inputColour.addEventListener('input',colourUpdate);

	const colourButtons = document.querySelectorAll('div.colour');
	const layerButtons = document.querySelectorAll('div.layerSelector');
	const brushButtons = document.querySelectorAll('div.brushStyleSelector');
	const clearButton = document.getElementById('clearButton');
	clearButton.addEventListener('click',clearCanvas);
	
	let brush = document.getElementById('brush');
	
	numColours = colourButtons.length;
	numLayers = canvases.length;

	currentContext.lineWidth = 10;
	let brushSize = currentContext.lineWidth;
	let isDrawing = false;
	let isErasing = false;
	let brushColour;
	brushColour = '#000000';
	let currentBrushStyle = 'round';

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

	// Add layer button listeners
	for(i=0;i<numLayers;i++){
		(function(){
			var index = i;
			layerButtons[i].addEventListener('click',function(){
				changeContext(index);
			});
		}());
	}

	// Add brush style button listeners
	for(i=0;i<numLayers;i++){
		(function(){
			var index = i;
			brushButtons[i].addEventListener('click',function(){
				changeBrushStyle(index);
			});
		}());
	}

	for(i=0;i<numLayers;i++){
		contexts[i].lineCap = "round";
	}
	for(i=0;i<numLayers;i++){
		canvases[i].height = window.innerHeight;
		canvases[i].width = window.innerWidth;
	}
	brushCanvas.height = canvases[0].height;
	brushCanvas.width = canvases[0].width;

	function colourUpdate(){
		brushColour = inputColour.value;
		brushContext.fillStyle = brushColour;
		let rectDimensions;
		let colourOffset = document.getElementsByClassName('inputColour')[0].offsetLeft;//inputColour.offsetLeft;
		if(window.innerWidth > 1270){
			rectDimensions = 0.04*window.innerWidth;
		}
		else{
			rectDimensions = 53;
		}
		brushContext.fillRect(colourOffset,0.085*window.innerHeight,rectDimensions,rectDimensions);
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
		colourUpdate();
		computeDraw(e,brushContext,brushColour);
	}

	function computeDraw(e,ctx,colour){
		ctx.lineWidth = brushSize;
		ctx.lineCap = currentBrushStyle;
		ctx.lineTo(getMousePos(e)[0],getMousePos(e)[1]);
		ctx.strokeStyle = colour;
		ctx.stroke()
		ctx.beginPath();
		ctx.moveTo(getMousePos(e)[0],getMousePos(e)[1]);
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
		drawBrush(e)
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
		currentContext = contexts[index]
		brushCanvas.style.zIndex = -2*index + 6;
	}

	function changeBrushStyle(index){
		currentBrushStyle = brushDict[index];
	}

	function getMousePos(e) {
        var rect = brushCanvas.getBoundingClientRect();
        return [(e.clientX - rect.left)/(rect.right-rect.left)*brushCanvas.width,
        		(e.clientY - rect.top)/(rect.bottom-rect.top)*brushCanvas.height];
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

	window.addEventListener('mousemove',draw);

	window.addEventListener('mousedown',function(e){
		switch(e.button){
			case 0:
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



