

(function(window,document,undefined){






    function Palette()
    {
    	var canvas, context, offsetx, offsety, radius = 90,
    	count = 1080, oneDivCount = 1 / count, countDiv360 = count / 360, degreesToRadians = Math.PI / 180,
    	i, color, angle, angle_cos, angle_sin, gradient;

    	canvas = document.createElement("canvas");
    	canvas.width = 250;
    	canvas.height = 250;

    	offsetx = canvas.width / 2;
    	offsety = canvas.height / 2;

    	context = canvas.getContext("2d");
    	context.lineWidth = 1;

    	function HSB2RGB(hue, sat, val)
    	{
    		var red, green, blue,
    		i, f, p, q, t;

    		if (val == 0)
    			return [ 0, 0, 0 ];

    		hue *= 0.016666667; // /= 60;
    		sat *= 0.01; // /= 100;
    		val *= 0.01; // /= 100;

    		i = Math.floor(hue);
    		f = hue - i;
    		p = val * (1 - sat);
    		q = val * (1 - (sat * f));
    		t = val * (1 - (sat * (1 - f)));

    		switch(i)
    		{
    			case 0: red = val; green = t; blue = p; break;
    			case 1: red = q; green = val; blue = p; break;
    			case 2: red = p; green = val; blue = t; break;
    			case 3: red = p; green = q; blue = val; break;
    			case 4: red = t; green = p; blue = val; break;
    			case 5: red = val; green = p; blue = q; break;
    		}

    		return [red, green, blue];
    	}

    	// http://www.boostworthy.com/blog/?p=226	

    	for(i = 0; i < count; i++)
    	{
    		color = HSB2RGB( Math.floor( (i * oneDivCount) * 360 ), 100, 100);
    		angle = i / countDiv360 * degreesToRadians;
    		angle_cos = Math.cos(angle);
    		angle_sin = Math.sin(angle);

    		context.strokeStyle = "rgb(" + Math.floor( color[0] * 255 ) + "," + Math.floor( color[1] * 255 ) + "," + Math.floor( color[2] * 255 ) + ")";
    		context.beginPath();
    		context.moveTo(angle_cos + offsetx, angle_sin + offsety);
    		context.lineTo(angle_cos * radius + offsetx, angle_sin * radius + offsety);
    		context.stroke();
    	}

    	gradient = context.createRadialGradient(offsetx, offsetx, 0, offsetx, offsetx, radius);
    	gradient.addColorStop(0.1, 'rgba(255, 255, 255, 1)');
    	gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    	context.fillStyle = gradient;
    	context.fillRect(0, 0, canvas.width, canvas.height);

    	return canvas;
    }




    function ColorSelector( gradient )
    {
    	this.init( gradient );
    }

    ColorSelector.prototype =
    {
    	container: null,

    	hue: null,
    	hueSelector: null,
    	hueData: null,

    	luminosity: null,
    	luminositySelector: null,
    	luminosityData: null,
    	luminosityPosition: null,

    	init: function(gradient)
    	{
    		var context;

    		this.container = document.createElement("div");
    		this.container.style.position = 'absolute';
    		this.container.style.width = '250px';
    		this.container.style.height = '250px';
    		this.container.style.visibility = 'hidden';
    		this.container.style.cursor = 'pointer';

    		this.hue = document.createElement("canvas");
    		this.hue.width = gradient.width;
    		this.hue.height = gradient.height;

    		context = this.hue.getContext("2d");
    		context.drawImage(gradient, 0, 0, this.hue.width, this.hue.height);

    		this.hueData = context.getImageData(0, 0, this.hue.width, this.hue.height).data;	

    		this.container.appendChild(this.hue);

    		this.luminosity = document.createElement("canvas");
    		this.luminosity.style.position = 'absolute';
    		this.luminosity.style.left = '0px';
    		this.luminosity.style.top = '0px';
    		this.luminosity.width = 250;
    		this.luminosity.height = 250;

    		this.container.appendChild(this.luminosity);

    		this.updateLuminosity( [255, 255, 255] );

    		this.hueSelector = document.createElement("canvas");
    		this.hueSelector.style.position = 'absolute';
    		this.hueSelector.style.left = ((this.hue.width - 15) / 2 ) + 'px';
    		this.hueSelector.style.top = ((this.hue.height - 15) / 2 ) + 'px';
    		this.hueSelector.width = 15;
    		this.hueSelector.height = 15;

    		context = this.hueSelector.getContext("2d");
    		context.lineWidth = 2;
    		context.strokeStyle = "rgba(0, 0, 0, 0.5)";
    		context.beginPath();
    		context.arc(8, 8, 6, 0, Math.PI * 2, true);
    		context.stroke();
    		context.strokeStyle = "rgba(256, 256, 256, 0.8)";
    		context.beginPath();
    		context.arc(7, 7, 6, 0, Math.PI * 2, true);
    		context.stroke();

    		this.container.appendChild( this.hueSelector );

    		this.luminosityPosition = [ (gradient.width - 15), (gradient.height - 15) / 2 ];

    		this.luminositySelector = document.createElement("canvas");
    		this.luminositySelector.style.position = 'absolute';
    		this.luminositySelector.style.left = (this.luminosityPosition[0] - 7) + 'px';
    		this.luminositySelector.style.top = (this.luminosityPosition[1] - 7) + 'px';
    		this.luminositySelector.width = 15;
    		this.luminositySelector.height = 15;

    		context = this.luminositySelector.getContext("2d");
    		context.drawImage(this.hueSelector, 0, 0, this.luminositySelector.width, this.luminositySelector.height);

    		this.container.appendChild(this.luminositySelector);
    	},

    	show: function()
    	{
    		this.container.style.visibility = 'visible';
    	},

    	hide: function()
    	{
    		this.container.style.visibility = 'hidden';		
    	},

    	updateLuminosity: function( color )
    	{
    		var context, angle, angle_cos, angle_sin, shade, offsetx, offsety,
    		inner_radius = 100, outter_radius = 120, i, count = 1080 / 2, oneDivCount = 1 / count, degreesToRadians = Math.PI / 180,
    		countDiv360 = (count / 360);

    		offsetx = this.luminosity.width / 2;
    		offsety = this.luminosity.height / 2;

    		context = this.luminosity.getContext("2d");
    		context.lineWidth = 3;
    		context.clearRect(0, 0, this.luminosity.width, this.luminosity.height);

    		for(i = 0; i < count; i++)
    		{
    			angle = i / countDiv360 * degreesToRadians;
    			angle_cos = Math.cos(angle);
    			angle_sin = Math.sin(angle);

    			shade = 255 - (i * oneDivCount /* / count */) * 255;

    			context.strokeStyle = "rgb(" + Math.floor( color[0] - shade ) + "," + Math.floor( color[1] - shade ) + "," + Math.floor( color[2] - shade ) + ")";
    			context.beginPath();
    			context.moveTo(angle_cos * inner_radius + offsetx, angle_sin * inner_radius + offsety);
    			context.lineTo(angle_cos * outter_radius + offsetx, angle_sin * outter_radius + offsety);
    			context.stroke();
    		}

    		this.luminosityData = context.getImageData(0, 0, this.luminosity.width, this.luminosity.height).data;
    	},

    	update: function(x, y)
    	{
    		var dx, dy, d, nx, ny;

    		dx = x - 125;
    		dy = y - 125;
    		d = Math.sqrt( dx * dx + dy * dy );

    		if (d < 90)
    		{
    			this.hueSelector.style.left = (x - 7) + 'px';
    			this.hueSelector.style.top = (y - 7) + 'px';
    			this.updateLuminosity( [ this.hueData[(x + (y * 250)) * 4], this.hueData[(x + (y * 250)) * 4 + 1], this.hueData[(x + (y * 250)) * 4 + 2] ] );
    		}
    		else if (d > 100)
    		{
    			nx = dx / d;
    			ny = dy / d;

    			this.luminosityPosition[0] = (nx * 110) + 125;
    			this.luminosityPosition[1] = (ny * 110) + 125;

    			this.luminositySelector.style.left = ( this.luminosityPosition[0] - 7) + 'px';
    			this.luminositySelector.style.top = ( this.luminosityPosition[1] - 7) + 'px';			
    		}
    	},

    	getColor: function()
    	{
    		var x, y;

    		x = Math.floor(this.luminosityPosition[0]);
    		y = Math.floor(this.luminosityPosition[1]);

    		return [ this.luminosityData[(x + (y * 250)) * 4], this.luminosityData[(x + (y * 250)) * 4 + 1], this.luminosityData[(x + (y * 250)) * 4 + 2] ];
    	}
    }




    function ribbon( context )
    {
    	this.init( context );
    }

    ribbon.prototype =
    {
    	context: null,

    	mouseX: null, mouseY: null,

    	painters: null,

    	interval: null,

    	init: function( context )
    	{
    		this.context = context;
    		this.context.lineWidth = 1;
    		this.context.globalCompositeOperation = 'source-over';

    		this.mouseX = SCREEN_WIDTH / 2;
    		this.mouseY = SCREEN_HEIGHT / 2;

    		this.painters = new Array();

    		for (var i = 0; i < 50; i++)
    		{
    			this.painters.push({ dx: SCREEN_WIDTH / 2, dy: SCREEN_HEIGHT / 2, ax: 0, ay: 0, div: 0.1, ease: Math.random() * 0.2 + 0.6 });
    		}

    		this.isDrawing = false;

    		this.interval = setInterval( bargs( function( _this ) { _this.update(); return false; }, this ), 1000/60 );
    	},

    	destroy: function()
    	{
    		clearInterval(this.interval);
    	},

    	strokeStart: function( mouseX, mouseY )
    	{
    		this.mouseX = mouseX;
    		this.mouseY = mouseY

    		this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", 0.05 )";		

    		for (var i = 0; i < this.painters.length; i++)
    		{
    			this.painters[i].dx = mouseX;
    			this.painters[i].dy = mouseY;
    		}

    		this.shouldDraw = true;
    	},

    	stroke: function( mouseX, mouseY )
    	{
    		this.mouseX = mouseX;
    		this.mouseY = mouseY;
    	},

    	strokeEnd: function()
    	{

    	},

    	update: function()
    	{
    		var i;

    		for (i = 0; i < this.painters.length; i++)
    		{
    			this.context.beginPath();
    			this.context.moveTo(this.painters[i].dx, this.painters[i].dy);		

    			this.painters[i].dx -= this.painters[i].ax = (this.painters[i].ax + (this.painters[i].dx - this.mouseX) * this.painters[i].div) * this.painters[i].ease;
    			this.painters[i].dy -= this.painters[i].ay = (this.painters[i].ay + (this.painters[i].dy - this.mouseY) * this.painters[i].div) * this.painters[i].ease;
    			this.context.lineTo(this.painters[i].dx, this.painters[i].dy);
    			this.context.stroke();
    		}
    	}
    }

    function bargs( _fn )
    {
    	var n, args = [];
    	for( n = 1; n < arguments.length; n++ )
    		args.push( arguments[ n ] );
    	return function () { return _fn.apply( this, args ); };
    }













    var i, brush, BRUSHES = ["ribbon"],
    COLOR = [0, 0, 0], BACKGROUND_COLOR = [250, 250, 250],
    SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    container, foregroundColorSelector, backgroundColorSelector, menu, about,
    canvas, flattenCanvas, context,
    isForegroundColorSelectorVisible = false, isBackgroundColorSelectorVisible = false, isAboutVisible = false,
    isMenuMouseOver = false, shiftKeyIsDown = false, altKeyIsDown = false;

    init();


function init()
{
	var hash, palette;
	
	document.body.style.backgroundColor = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';

	container = document.createElement('div');
	document.body.appendChild(container);
	
	canvas = document.createElement("canvas");
	canvas.width = SCREEN_WIDTH;
	canvas.height = SCREEN_HEIGHT;
	canvas.style.cursor = 'crosshair';
	container.appendChild(canvas);
	
	if (!canvas.getContext) return;
	
	context = canvas.getContext("2d");
	
	flattenCanvas = document.createElement("canvas");
	flattenCanvas.width = SCREEN_WIDTH;
	flattenCanvas.height = SCREEN_HEIGHT;
	
	palette = new Palette();
	
	foregroundColorSelector = new ColorSelector(palette);
	foregroundColorSelector.container.addEventListener('mousedown', onForegroundColorSelectorMouseDown, false);
	foregroundColorSelector.container.addEventListener('touchstart', onForegroundColorSelectorTouchStart, false);
	container.appendChild(foregroundColorSelector.container);

	backgroundColorSelector = new ColorSelector(palette);
	backgroundColorSelector.container.addEventListener('mousedown', onBackgroundColorSelectorMouseDown, false);
	backgroundColorSelector.container.addEventListener('touchstart', onBackgroundColorSelectorTouchStart, false);
	container.appendChild(backgroundColorSelector.container);	
	


	

	if (!brush)
	{
		brush = new ribbon(context);
	}
	

	window.addEventListener('mousemove', onWindowMouseMove, false);
	window.addEventListener('resize', onWindowResize, false);
	window.addEventListener('keydown', onDocumentKeyDown, false);
	window.addEventListener('keyup', onDocumentKeyUp, false);
	
	document.addEventListener('mousedown', onDocumentMouseDown, false);
	document.addEventListener('mouseout', onCanvasMouseUp, false);
	
	canvas.addEventListener('mousemove', onCanvasMouseMove, false);
	canvas.addEventListener('touchstart', onCanvasTouchStart, false);
	
	onWindowResize(null);
}


// WINDOW

function onWindowMouseMove( event )
{
	mouseX = event.clientX;
	mouseY = event.clientY;
}

function onWindowResize()
{
	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;
	
	menu.container.style.left = ((SCREEN_WIDTH - menu.container.offsetWidth) / 2) + 'px';
	
	about.container.style.left = ((SCREEN_WIDTH - about.container.offsetWidth) / 2) + 'px';
	about.container.style.top = ((SCREEN_HEIGHT - about.container.offsetHeight) / 2) + 'px';
}


// DOCUMENT

function onDocumentMouseDown( event )
{
	if (!isMenuMouseOver)
		event.preventDefault();
}

function onDocumentKeyDown( event )
{
	if (shiftKeyIsDown)
		return;
		
	switch(event.keyCode)
	{
		case 16: // Shift
			shiftKeyIsDown = true;
			foregroundColorSelector.container.style.left = mouseX - 125 + 'px';
			foregroundColorSelector.container.style.top = mouseY - 125 + 'px';
			foregroundColorSelector.container.style.visibility = 'visible';
			break;
		case 18: // Alt
			altKeyIsDown = true;
			break;
		case 82: // r
			brush.destroy();
			brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");
			break;
	}
}

function onDocumentKeyUp( event )
{
	switch(event.keyCode)
	{
		case 16: // Shift
			shiftKeyIsDown = false;
			foregroundColorSelector.container.style.visibility = 'hidden';			
			break;
		case 18: // Alt
			altKeyIsDown = false;
			break;	
	}
}

// COLOR SELECTORS

function setForegroundColor( x, y )
{
	foregroundColorSelector.update( x, y );
	COLOR = foregroundColorSelector.getColor();
	menu.setForegroundColor( COLOR );	
}

function onForegroundColorSelectorMouseDown( event )
{
	window.addEventListener('mousemove', onForegroundColorSelectorMouseMove, false);
	window.addEventListener('mouseup', onForegroundColorSelectorMouseUp, false);
	
	setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );	
}

function onForegroundColorSelectorMouseMove( event )
{
	setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );
}

function onForegroundColorSelectorMouseUp( event )
{
	window.removeEventListener('mousemove', onForegroundColorSelectorMouseMove, false);
	window.removeEventListener('mouseup', onForegroundColorSelectorMouseUp, false);

	setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );
}

function onForegroundColorSelectorTouchStart( event )
{
	if(event.touches.length == 1)
	{
		event.preventDefault();
		
		setForegroundColor( event.touches[0].pageX - foregroundColorSelector.container.offsetLeft, event.touches[0].pageY - foregroundColorSelector.container.offsetTop );
		
		window.addEventListener('touchmove', onForegroundColorSelectorTouchMove, false);
		window.addEventListener('touchend', onForegroundColorSelectorTouchEnd, false);
	}
}

function onForegroundColorSelectorTouchMove( event )
{
	if(event.touches.length == 1)
	{
		event.preventDefault();
		
		setForegroundColor( event.touches[0].pageX - foregroundColorSelector.container.offsetLeft, event.touches[0].pageY - foregroundColorSelector.container.offsetTop );
	}
}

function onForegroundColorSelectorTouchEnd( event )
{
	if(event.touches.length == 0)
	{
		event.preventDefault();
		
		window.removeEventListener('touchmove', onForegroundColorSelectorTouchMove, false);
		window.removeEventListener('touchend', onForegroundColorSelectorTouchEnd, false);
	}	
}


//

function setBackgroundColor( x, y )
{
	backgroundColorSelector.update( x, y );
	BACKGROUND_COLOR = backgroundColorSelector.getColor();
	menu.setBackgroundColor( BACKGROUND_COLOR );
	
	document.body.style.backgroundColor = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';	
}

function onBackgroundColorSelectorMouseDown( event )
{
	window.addEventListener('mousemove', onBackgroundColorSelectorMouseMove, false);
	window.addEventListener('mouseup', onBackgroundColorSelectorMouseUp, false);
}

function onBackgroundColorSelectorMouseMove( event )
{
	setBackgroundColor( event.clientX - backgroundColorSelector.container.offsetLeft, event.clientY - backgroundColorSelector.container.offsetTop );
}

function onBackgroundColorSelectorMouseUp( event )
{
	window.removeEventListener('mousemove', onBackgroundColorSelectorMouseMove, false);
	window.removeEventListener('mouseup', onBackgroundColorSelectorMouseUp, false);
	
	setBackgroundColor( event.clientX - backgroundColorSelector.container.offsetLeft, event.clientY - backgroundColorSelector.container.offsetTop );
}


function onBackgroundColorSelectorTouchStart( event )
{
	if(event.touches.length == 1)
	{
		event.preventDefault();
		
		setBackgroundColor( event.touches[0].pageX - backgroundColorSelector.container.offsetLeft, event.touches[0].pageY - backgroundColorSelector.container.offsetTop );
		
		window.addEventListener('touchmove', onBackgroundColorSelectorTouchMove, false);
		window.addEventListener('touchend', onBackgroundColorSelectorTouchEnd, false);
	}
}

function onBackgroundColorSelectorTouchMove( event )
{
	if(event.touches.length == 1)
	{
		event.preventDefault();
		
		setBackgroundColor( event.touches[0].pageX - backgroundColorSelector.container.offsetLeft, event.touches[0].pageY - backgroundColorSelector.container.offsetTop );
	}
}

function onBackgroundColorSelectorTouchEnd( event )
{
	if(event.touches.length == 0)
	{
		event.preventDefault();
		
		window.removeEventListener('touchmove', onBackgroundColorSelectorTouchMove, false);
		window.removeEventListener('touchend', onBackgroundColorSelectorTouchEnd, false);
	}	
}


// MENU

function onMenuForegroundColor()
{
	cleanPopUps();
	
	foregroundColorSelector.show();
	foregroundColorSelector.container.style.left = ((SCREEN_WIDTH - foregroundColorSelector.container.offsetWidth) / 2) + 'px';
	foregroundColorSelector.container.style.top = ((SCREEN_HEIGHT - foregroundColorSelector.container.offsetHeight) / 2) + 'px';

	isForegroundColorSelectorVisible = true;
}

function onMenuBackgroundColor()
{
	cleanPopUps();

	backgroundColorSelector.show();
	backgroundColorSelector.container.style.left = ((SCREEN_WIDTH - backgroundColorSelector.container.offsetWidth) / 2) + 'px';
	backgroundColorSelector.container.style.top = ((SCREEN_HEIGHT - backgroundColorSelector.container.offsetHeight) / 2) + 'px';

	isBackgroundColorSelectorVisible = true;
}

function onMenuSelectorChange()
{
	if (BRUSHES[menu.selector.selectedIndex] == "")
		return;

	brush.destroy();
	brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");

	window.location.hash = BRUSHES[menu.selector.selectedIndex];
}

function onMenuMouseOver()
{
	isMenuMouseOver = true;
}

function onMenuMouseOut()
{
	isMenuMouseOver = false;
}

function onMenuSave()
{
	var context = flattenCanvas.getContext("2d");
	
	context.fillStyle = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.drawImage(canvas, 0, 0);

	window.open(flattenCanvas.toDataURL("image/png"),'mywindow');
}

function onMenuClear()
{
	context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	brush.destroy();
	brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");
}

function onMenuAbout()
{
	cleanPopUps();

	isAboutVisible = true;
	about.show();
}


// CANVAS



function onCanvasMouseMove( event )
{
	if (!brush.isStroking) {
	    brush.strokeStart( event.clientX, event.clientY );
	    brush.isStroking = true;
	    return;
	}
    
	brush.stroke( event.clientX, event.clientY );
}

function onCanvasMouseUp()
{
	brush.strokeEnd();
	
	window.removeEventListener('mousemove', onCanvasMouseMove, false);	
	window.removeEventListener('mouseup', onCanvasMouseUp, false);
}


//

function onCanvasTouchStart( event )
{
	cleanPopUps();		

	if(event.touches.length == 1)
	{
		event.preventDefault();
		
		brush.strokeStart( event.touches[0].pageX, event.touches[0].pageY );
		
		window.addEventListener('touchmove', onCanvasTouchMove, false);
		window.addEventListener('touchend', onCanvasTouchEnd, false);
	}
}

function onCanvasTouchMove( event )
{
	if(event.touches.length == 1)
	{
		event.preventDefault();
		brush.stroke( event.touches[0].pageX, event.touches[0].pageY );
	}
}

function onCanvasTouchEnd( event )
{
	if(event.touches.length == 0)
	{
		event.preventDefault();
		
		brush.strokeEnd();

		window.removeEventListener('touchmove', onCanvasTouchMove, false);
		window.removeEventListener('touchend', onCanvasTouchEnd, false);
	}
}

//

function cleanPopUps()
{
	if (isForegroundColorSelectorVisible)
	{
		foregroundColorSelector.hide();
		isForegroundColorSelectorVisible = false;
	}
		
	if (isBackgroundColorSelectorVisible)
	{
		backgroundColorSelector.hide();
		isBackgroundColorSelectorVisible = false;
	}
	
	if (isAboutVisible)
	{
		about.hide();
		isAboutVisible = false;
	}
}








})(this,this.document);