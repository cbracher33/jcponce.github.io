/*************************************
Script to draw a graph
<p>
Tim McIntyre
<br>V2
<br>June 2015
*************************************/
function XYGraph(context) {
	this.context = context;		
	this.imagechanged = true;
	this.x = new Array();
	this.y = new Array();
	this.points = 0;
		
	this.xmin = 0;
	this.xmax = 1;
	this.ymin = 0;
	this.ymax = 1;
	
	this.width = 100;
	this.height = 100;
	this.left = 0;
	this.top = 0;
	
	this.axissizeleft = 0.1;
	this.axisizebottom = 0.1;
	
	this.fontsize = 14;
	this.sigfigs = 2;
		
	this.xlabel = "x";
	this.ylabel = "y";
	this.xunit = "";
	this.yunit = "";
	this.title = "";
	
	this.xgrid = 4;
	this.ygrid = 4;
	this.textmargin = 5;

	this.radius = 3;
	
	this.selected = -1;
	
	this.drawover = false;
	this.drawpoints = false;
	this.drawline = true;
	this.drawcursor = false;
	this.drawlabels = true;
	this.boxon = false;
	
	this.background = "#CCCCCC";
	this.foreground = "#FFFFFF";
	this.curvecolour = "#0000FF";
	this.excludecurvecolour = "#0000aa";
	this.cursorcolour = "#FFFFFF";
	
	this.tstring = new TString();
			
}

/************************************
 Adds a point to the arrays
 ************************************/
XYGraph.prototype.addPoint = function(x, y) {
	this.x[this.points] = x;
	this.y[this.points] = y;
	this.points++;
}

/************************************
 Autoscales the limits
 ************************************/
XYGraph.prototype.autoscale = function() {
	this.autoscaleX();
	this.autoscaleY();
}

/************************************
 Autoscales the limits
 ************************************/
XYGraph.prototype.autoscaleX = function() {
	if (this.points > 0) {
		this.xmin = this.x[0];
		this.xmax = this.x[0];
		for (var p = 1; p < this.points; p++) {
			if (this.x[p] < this.xmin) this.xmin = this.x[p];
			if (this.x[p] > this.xmax) this.xmax = this.x[p];
		}
		if (this.xmin == this.xmax) this.xmax = this.xmin + 1;
	}
}

/************************************
 Autoscales the limits
 ************************************/
XYGraph.prototype.autoscaleY = function() {
	if (this.points > 0) {
		this.ymin = this.y[0];
		this.ymax = this.y[0];
		for (var p = 1; p < this.points; p++) {
			if (this.y[p] < this.ymin) this.ymin = this.y[p];
			if (this.y[p] > this.ymax) this.ymax = this.y[p];
		}
		if (this.ymin == this.ymax) this.ymax = this.ymin + 1;
	}
}

/************************************
 Redraws the screen
 ************************************/
XYGraph.prototype.draw = function() {

	if (!this.drawover) {

		// Clear and draw box around full area
		this.context.fillStyle = this.background;
		this.context.fillRect(this.left, this.top, this.width, this.height);

		if (this.boxon) {
			this.context.strokeStyle = this.foreground;
			this.context.beginPath();
			this.context.rect(this.left, this.top, this.width, this.height);
			this.context.stroke();
		}
			
		if (this.points > 0) {
			if (this.drawlabels) {
				// Define text styles
				var dum = "";
				this.context.font="" + this.fontsize + "px Helvetica";
				this.context.fillStyle = this.foreground;
	
				// x-limits
				this.context.textAlign = 'center';
				this.context.textBaseline = 'top';
				dum = this.tstring.valueOfSigFig(this.xmin,this.sigfigs);
				this.context.fillText(dum, this.plotleft, this.plottop + this.plotheight + this.textmargin);
				dum = this.tstring.valueOfSigFig(this.xmax,this.sigfigs);
				this.context.fillText(dum, this.plotleft + this.plotwidth, this.plottop + this.plotheight + this.textmargin);
	
				// y-limits
				this.context.textAlign = 'right';
				this.context.textBaseline = 'middle';
				dum = this.tstring.valueOfSigFig(this.ymin,this.sigfigs);
				this.context.fillText(dum, this.plotleft - this.textmargin, this.plottop + this.plotheight);
				dum = this.tstring.valueOfSigFig(this.ymax,this.sigfigs);
				this.context.fillText(dum, this.plotleft - this.textmargin, this.plottop);
	
				// x-label
				this.context.textAlign = 'center';
				this.context.textBaseline = 'top';
				var xl = this.xlabel
				if (this.xunit.length > 0)
				xl = xl + " (" + this.xunit + ")";
				this.context.fillText(xl, this.plotleft + this.plotwidth / 2, this.plottop + this.plotheight + this.textmargin);

				// y-label
				this.context.textAlign = 'center';
				this.context.textBaseline = 'bottom';
				var yl = this.ylabel
				if (this.yunit.length > 0)
				yl = yl + " (" + this.yunit + ")";
				this.context.save();
				this.context.translate(this.plotleft - this.textmargin, this.plottop + this.plotheight / 2);
				this.context.rotate(-Math.PI/2);
				this.context.fillText(yl, 0, 0);
				this.context.restore();
	
				// Title
				this.context.textAlign = 'center';
				this.context.textBaseline = 'bottom';
				this.context.fillText(this.title, this.plotleft + this.plotwidth / 2, this.plottop - 2);
			}

			// Draw box around plot
			this.context.lineWidth = 2;
			this.context.strokeStyle = this.foreground;
			this.context.beginPath();
			this.context.rect(this.plotleft, this.plottop, this.plotwidth, this.plotheight);
			this.context.stroke();
			this.context.save();
			this.context.clip();
	
			// Draw grid lines
			this.context.strokeStyle = this.foreground;
			this.context.lineWidth = 1;
			// x grid lines
			for (var i = 1; i < this.xgrid; i++) {
				this.context.beginPath();
				this.context.moveTo(this.plotleft + i * this.plotwidth / this.xgrid, this.plottop);
				this.context.lineTo(this.plotleft + i * this.plotwidth / this.xgrid, this.plottop + this.plotheight);
				this.context.stroke();
			}
			// y grid lines
			for (var i = 1; i < this.ygrid; i++) {
				this.context.beginPath();
				this.context.moveTo(this.plotleft, this.plottop + i * this.plotheight / this.ygrid);
				this.context.lineTo(this.plotleft + this.plotwidth, this.plottop + i * this.plotheight / this.ygrid);
				this.context.stroke();
			}

			this.context.restore();
		
		} else {
			// No data
			this.context.font="18px Times";
			this.context.fillStyle = '#000000';
			this.context.textAlign = 'center';
			this.context.textBaseline = 'middle';
			this.context.fillText("No data available", this.width / 2, this.height / 2);
		}
	}
	// Limit box around plot
	this.context.save();
	this.context.beginPath();
	this.context.rect(this.plotleft, this.plottop, this.plotwidth, this.plotheight);
	this.context.clip();

	// Draw fit
	if (this.drawline) {
		this.context.strokeStyle = this.curvecolour;
		this.context.lineWidth = 2;
		this.context.beginPath();
		var px = this.plotleft + (this.x[0]-this.xmin)/(this.xmax-this.xmin) * this.plotwidth;
		var py = this.plottop + this.plotheight - (this.y[0]-this.ymin)/(this.ymax-this.ymin) * this.plotheight;
		this.context.moveTo(px,py);
		for (var i = 1; i < this.points; i++) {
			var px = this.plotleft + (this.x[i]-this.xmin)/(this.xmax-this.xmin) * this.plotwidth;
			var py = this.plottop + this.plotheight - (this.y[i]-this.ymin)/(this.ymax-this.ymin) * this.plotheight;
			this.context.lineTo(px,py);
		}
		this.context.stroke();
	}

	// Draw points
	if (this.drawpoints) {
		for (var i = 0; i < this.points; i++) {
			if (this.include && this.include[i])
				this.context.fillStyle = this.curvecolour;
			else
				this.context.fillStyle = this.excludecurvecolour;
			this.context.beginPath();
			px = this.plotleft + (this.x[i]-this.xmin)/(this.xmax-this.xmin) * this.plotwidth;
			py = this.plottop + this.plotheight - (this.y[i]-this.ymin)/(this.ymax-this.ymin) * this.plotheight;
			this.context.arc(px,py,this.radius,0,2*Math.PI);
			this.context.fill();
		}
	}
	
	// Draw Cursor
	if (this.drawcursor && this.drawline && !this.drawover && this.selected >= 0 && this.selected < this.points) {
		var halflength = 5;
		this.context.strokeStyle = this.cursorcolour;
		this.context.lineWidth = 2;
		this.context.beginPath();
		var px = this.plotleft + (this.x[this.selected]-this.xmin)/(this.xmax-this.xmin) * this.plotwidth - halflength;
		var py = this.plottop + this.plotheight - (this.y[this.selected]-this.ymin)/(this.ymax-this.ymin) * this.plotheight;
		this.context.moveTo(px,py);
		px = this.plotleft + (this.x[this.selected]-this.xmin)/(this.xmax-this.xmin) * this.plotwidth + halflength;
		py = this.plottop + this.plotheight - (this.y[this.selected]-this.ymin)/(this.ymax-this.ymin) * this.plotheight;
		this.context.lineTo(px,py);
		this.context.stroke();
		this.context.beginPath();
		var px = this.plotleft + (this.x[this.selected]-this.xmin)/(this.xmax-this.xmin) * this.plotwidth;
		var py = this.plottop + this.plotheight - (this.y[this.selected]-this.ymin)/(this.ymax-this.ymin) * this.plotheight - halflength;
		this.context.moveTo(px,py);
		px = this.plotleft + (this.x[this.selected]-this.xmin)/(this.xmax-this.xmin) * this.plotwidth;
		py = this.plottop + this.plotheight - (this.y[this.selected]-this.ymin)/(this.ymax-this.ymin) * this.plotheight + halflength;
		this.context.lineTo(px,py);
		this.context.stroke();
	}
	
	this.context.restore();
	
}


/************************************
 Initiates all parameters
 ************************************/
XYGraph.prototype.init = function() {
	if (this.drawlabels) {
		this.plotleft = this.left + this.axissizeleft * this.width;
		if (this.plotleft - this.left < this.fontsize + this.textmargin)
			this.plotleft = this.left + this.fontsize + this.textmargin;		
		this.plotwidth = this.width - 2 * (this.plotleft - this.left);
	
		this.plottop = this.top + this.axisizebottom * this.height;
		if (this.plottop - this.top < this.fontsize + this.textmargin)
			this.plottop = this.top + this.fontsize + this.textmargin;
		this.plotheight = this.height - 2 * (this.plottop - this.top);
	} else {
		this.plotleft = this.left;
		this.plotwidth = this.width;
	
		this.plottop = this.top;
		this.plotheight = this.height;
	}
}

/*************************************
Open a print window
*************************************/
XYGraph.prototype.printWindow = function() {
	this.printCanvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    this.printCanvas.width = this.width;
    this.printCanvas.height = this.height;

    this.printContext = this.printCanvas.getContext("2d");
	this.printWindow = window.open("", "", "width=800,height=400");
    this.printWindow.document.body.appendChild(this.printCanvas);
    
    this.draw(this.printContext,false);
    
}

/***********************************
Lookup a graph coordinate from a screen coordinate
************************************/

XYGraph.prototype.lookupGraph = function(x, y) {
  x = (x-this.plotleft)*(this.xmax-this.xmin)/this.plotwidth + this.xmin;
  y = -(y-this.plottop)*(this.ymax-this.ymin)/this.plotheight + this.ymax;
  if (x < this.xmin || x > this.xmax) return null;
  if (y < this.ymin || y > this.ymax) return null;
  return [x, y];
}

/***********************************
Lookup a screen coordinate from a graph coordinate
************************************/

XYGraph.prototype.lookupScreen = function(x, y) {
  if (x < this.xmin || x > this.xmax) return null;
  if (y < this.ymin || y > this.ymax) return null;
  x = (x - this.xmin)*this.plotwidth/(this.xmax-this.xmin) + this.plotleft;
  y = -(y - this.ymax)*this.plotheight/(this.ymax-this.ymin) + this.plottop;
  return [x, y];
}

/************************************
 Resets the arrays
 ************************************/
XYGraph.prototype.reset = function() {
	this.points = 0;
}

/************************************
 Sets the background colour
 ************************************/
XYGraph.prototype.setBackground = function(background) {
	this.background = background;
}

/************************************
 Sets the curve colour
 ************************************/
XYGraph.prototype.setCurveColour = function(curvecolour) {
	this.curvecolour = curvecolour;
}

/************************************
 Sets the foreground colour
 ************************************/
XYGraph.prototype.setForeground = function(foreground) {
	this.foreground = foreground;
}

/************************************
 Sets the labels for the axes
 ************************************/
XYGraph.prototype.setLabels = function(xlabel, ylabel) {
	this.xlabel = xlabel;
	this.ylabel = ylabel;
}

/************************************
 Sets a point in the array
 ************************************/
XYGraph.prototype.setPoint = function(p, x, y) {
	if (p >= 0 && p < this.points) {
		this.x[p] = x;
		this.y[p] = y;
	}
}

/************************************
 Sets the position of the plot
 ************************************/
XYGraph.prototype.setPosition = function(left, top) {
	this.left = left;
	this.top = top;
	this.init();
}

/************************************
 Sets the size of the plot
 ************************************/
XYGraph.prototype.setSize = function(width, height) {
	this.width = width;
	this.height = height;
	this.init();
}

/************************************
 Sets the units for the axes
 ************************************/
XYGraph.prototype.setUnits = function(xunit, yunit) {
	this.xunit = xunit;
	this.yunit = yunit;
}

/************************************
 Sets the maximum and minimum values for the x axis
 ************************************/
XYGraph.prototype.setXLimits = function(xmin, xmax) {
	this.xmin = xmin;
	this.xmax = xmax;
}

/************************************
 Sets the maximum and minimum values for the y axis
 ************************************/
XYGraph.prototype.setYLimits = function(ymin, ymax) {
	this.ymin = ymin;
	this.ymax = ymax;
}

/************************************
 Generates an array of zeros
 ************************************/
XYGraph.prototype.zeros = function(points) {
	this.reset();
	for (var i = 0; i < points; i++)
		this.addPoint(0,0);
}


