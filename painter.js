

var colourDict={
	0: '#000000', // Black
	1: '#ffffff', // White
	2: '#b84248', // Light Red
	3: '#73272b', // Dark Red
	4: '#5a9acc', // Light Blue
	5: '#2d506b', // Dark Blue
	6: '#3dc475', // Light Green
	7: '#1e5e39' // Dark Green
}

window.addEventListener('load',() =>{
	const canvas = document.querySelector('#drawCanvas');
	const brushCanvas = document.querySelector('#brushCanvas');
	const inputColour = document.getElementsByClassName('inputColour')[0];
	const context = canvas.getContext('2d');
	const brushContext = brushCanvas.getContext('2d');
	const colours = document.querySelectorAll('div.colour');

	let brush = document.getElementById('brush');
	numColours = colours.length;
	context.lineWidth = 10;
	let brushSize = context.lineWidth;
	let mouseOffsetX = 81, mouseOffsetY = 3;
	let widthOffset = 100, heightOffset = 20;
	let isDrawing = false;
	let isErasing = false;
	let isFilling = false;
	let brushColour;
	brushColour = '#000000';

	for(i=0;i<numColours;i++){
		(function(){
			var self = colours[i];
			var tmpColour = colourDict[i];
			self.style.backgroundColor = tmpColour;
			colours[i].addEventListener('click',function(){
				setColour(tmpColour);
			});
		}());
	}
	context.lineCap = "round";
	canvas.height = window.innerHeight - heightOffset;
	canvas.width = window.innerWidth - widthOffset;
	brushCanvas.height = canvas.height;
	brushCanvas.width = canvas.width;

	function colourUpdate(){
		brushContext.fillStyle = brushColour;
		let rectDimensions;
		if(window.innerWidth > 1270){
			rectDimensions = 0.04*window.innerWidth;
		}
		else{
			rectDimensions = 53;
		}
		// brushContext.globalAlpha = 0.2;
		//brushContext.fillRect(0.0495*window.innerWidth,0.085*window.innerHeight,rectDimensions,rectDimensions);
		brushContext.fillRect(55,0.085*window.innerHeight,rectDimensions,rectDimensions);
		// brushContext.globalAlpha = 1.0;
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
		context.beginPath();
	}

	function endErase(){
		isErasing = false;
		context.beginPath();
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
		computeDraw(e,context,brushColour);		
	}

	function drawBrush(e){
		brushContext.clearRect(0, 0, canvas.width, canvas.height);
		if(isFilling){	
			return;
		}
		colourUpdate();
		computeDraw(e,brushContext,brushColour);
	}

	function computeDraw(e,ctx,colour){
		ctx.lineWidth = brushSize;
		ctx.lineCap = "round";
		ctx.lineTo(e.clientX-mouseOffsetX,e.clientY-mouseOffsetY);
		ctx.strokeStyle = colour;
		ctx.stroke()
		ctx.beginPath();
		ctx.moveTo(e.clientX-mouseOffsetX,e.clientY-mouseOffsetY);		
	}

	function erase(e){
		isDrawing = false;
		computeDraw(e,context,'#ffffff');
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
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	function imageToArray(){
		var rows = canvas.height;
		var cols = canvas.width;
		var array = new Array(rows);
		for(var i=0;i<array.length;i++){
			array[i] = new Array(cols);
		}
		for(var i=0;i<rows;i++){
			for(var j=0;j<cols;j++){
				array[i][j] = 255;
			}
		}
		return array;
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

	function undefinedToWhite(pixel){
		if(pixel === undefined){
			return 0;
		}
		return pixel;
	}

	function fillInit(e){
		var image = context.getImageData(0,0,canvas.width,canvas.height).data;
		var imgArray = imageToArray();
		var position = getMousePos(e);
		console.log(position);
		var targetColour = brushColour;
		console.log(typeof position);
		console.log(image.length);
		console.log(4*canvas.width*canvas.height);
		for(var i=0; i<canvas.height;i++){
			for(var j=0; j<canvas.width;j++){
				imgArray[i][j] = undefinedToWhite(image[0][canvas.width*i + j]);
				imgArray[i][j+1] = undefinedToWhite(image[1][canvas.width*i + j]);
				imgArray[i][j+2] = undefinedToWhite(image[2][canvas.width*i + j]);
			}	
		}
		// try{
		initialColour = rgbToHex(imgArray[position[1]][3*position[0]],imgArray[position[1]][3*position[0]+1],imgArray[position[1]][3*position[0]+2]);
		// }
	 //    catch(error){
	 //    	console.log(imgArray.length);
	 //    	console.log(imgArray[0].length);
	 //    	console.log(position[1]);
	 //    	console.log(3*position[0]);
	 //    }
		
		floodFill(position,initialColour,targetColour,imgArray);
	}

	function floodFill(position,initialColour,targetColour,imgArray){
		if(initialColour === targetColour){
			return;
		}
		context.fillStyle = targetColour;
		context.fillRect(position[0],position[1],1,1);
		hexTargetColour = hexToRgb(targetColour);
		imgArray[position[1]][3*position[0]+1] = hexTargetColour[0];
		imgArray[position[1]][3*position[0]+2] = hexTargetColour[1];
		imgArray[position[1]][3*position[0]+3] = hexTargetColour[2];
		// imgArray[position[0],position[1]] = hexToRgb(targetColour)[0];
		// imgArray[position[0],position[1]+1] = hexToRgb(targetColour)[1];
		// imgArray[position[0],position[1]+2] = hexToRgb(targetColour)[2];
		floodFill([position[0]+1,position[1]],initialColour,targetColour,imgArray);
		floodFill([position[0]-1,position[1]],initialColour,targetColour,imgArray);
		floodFill([position[0],position[1]-1],initialColour,targetColour,imgArray);
		floodFill([position[0],position[1]+1],initialColour,targetColour,imgArray);
		
		// floodFill([position[0]+1,position[1]],rgbToHex(imgArray[position[1]][3*(position[0]+1)],imgArray[position[1]][3*(position[0]+1)+1],imgArray[position[1]][3*(position[0]+1)+2]),targetColour,imgArray);
		// floodFill([position[0]-1,position[1]],rgbToHex(imgArray[position[1]][3*(position[0]-1)],imgArray[position[1]][3*(position[0]-1)+1],imgArray[position[1]][3*(position[0]-1)+2]),targetColour,imgArray);
		// floodFill([position[0],position[1]-1],rgbToHex(imgArray[position[1]-1][3*position[0]],imgArray[position[1]-1][3*position[0]+1],imgArray[position[1]-1][3*position[0]+2]),targetColour,imgArray);
		// floodFill([position[0],position[1]+1],rgbToHex(imgArray[position[1]+1][3*position[0]],imgArray[position[1]+1][3*position[0]+1],imgArray[position[1]+1][3*position[0]+2]),targetColour,imgArray);
		return;
	}	

	window.addEventListener('resize',() =>{
		canvas.height = window.innerHeight - heightOffset;
		canvas.width = window.innerWidth - widthOffset;
		brushCanvas.height = canvas.height;
		brushCanvas.width = canvas.width;
		colourUpdate();

	})

	function getMousePos(e) {
        var rect = canvas.getBoundingClientRect();
        return [e.clientX - rect.left,e.clientY - rect.top];
        // return {
        //   x: e.clientX - rect.left,
        //   y: e.clientY - rect.top
        // };
  	}


	window.addEventListener('mousemove',draw);
	window.addEventListener('mousedown',function(e){
		if(isFilling){
			fillInit(e);
			isFilling = false;
			return;
		}
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
	document.getElementsByClassName('inputColour')[0].addEventListener('change',colourUpdate);
	document.getElementById('clearButton').addEventListener('click',clearCanvas);
	document.getElementById('bucket').addEventListener('click',function(e){
		isFilling = true;
	});
	document.oncontextmenu = function() {
	  return false;
	}
	colourUpdate();
})



