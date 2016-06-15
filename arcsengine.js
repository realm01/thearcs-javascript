
var main = document.getElementById("canvas");
var draw = main.getContext("2d");

var fps = 80;
var arcs0 = new Array();

var startSpeed = new Vector2D(0, 0);
var gravitation = new Vector2D(0, 0);
var friction = 1;
var limitsBounce = new Limits(0.8, 0.98);
var limitsRadius = new Limits(4, 80);
var limitsSpeedX = new Limits(-20, 20);
var limitsSpeedY = new Limits(-20, 20);
var arcDetectionAccuracy = 0; //Higher is a lower accuracy
var useMouseGravitation = 0;
var inaccurateMode = 0;

var mousePosition = new Vector2D(0, 0);

var useMotionBlur = 1;

var frameIndex = 0;
var frames = new Array();
var motionBlur = 4; //Higher is more motion blur

// var backgroundImage = document.getElementById("arcsbackgroundimage");

/////////////////
////Configuration
/////////////////

draw.imageSmoothingEnabled = true;
draw.webkitSmoothingEnabled = true;
draw.mozImageSmoothingEnabled = true;

/////////////////
////Common Calls
/////////////////

PrepareMotionBlur();

window.requestAnimFrame = (function () {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000 / fps);
		};
})();

//setInterval('Animate()', 1000 / fps);
(function VSync () {
	requestAnimFrame(VSync);
	Animate();
})();

/////////////////
////Draw Calls
/////////////////

////////////////
////Calculation Calls
////////////////

////////////////
////Common Functions
////////////////

function Animate() {
	if(!document.getElementById('manualgravitationinputcheckbox').checked)
		CalculateGravitation();
	MoveArcs();
	DrawFrame();
}

////////////////
////Draw Functions
////////////////

function DrawFrame() {
	////Use Motion Blur Context
	try {
		var context = frames[frameIndex].context;
		////Clear Frame
		context.clearRect(0, 0, main.width, main.width);
		////Draw Grid
		context.beginPath();
		context.strokeStyle = "#000000";
		context.lineWidth = 1;
		context.moveTo(main.width / 2, 0);
		context.lineTo(main.width / 2, main.height);
		context.moveTo(main.width, main.height /2);
		context.lineTo(0, main.height / 2);
		context.stroke();
		context.closePath();
		//// Draw Arcs Fixed
		context.beginPath();
		context.fillStyle = '#000000';
		context.arc(main.width / 2, main.height / 2, 8, 0, 2 * Math.PI);
		context.fill();
		context.closePath();
		////Draw Text
		context.fillStyle = '#FF9400';
		context.font = 'bold 20px sans-serif';
		context.textBaseline = 'middle';
		context.fillText('Point of no Gravitation', main.width / 2 - 108, main.height / 2);
		////Draw Arcs Dynamic
		if(arcs0.length > 0) {
			for(var i = 0; i < arcs0.length; i++) {
				context.beginPath();
				var circularGradient = context.createRadialGradient(arcs0[i].position.x, arcs0[i].position.y, arcs0[i].r - arcs0[i].r / 2.8, arcs0[i].position.x, arcs0[i].position.y, arcs0[i].r);
				circularGradient.addColorStop(0, arcs0[i].color);
				circularGradient.addColorStop(1, '#000000');
				context.fillStyle = circularGradient;
				context.lineWidth = 4;
				context.arc(arcs0[i].position.x, arcs0[i].position.y, arcs0[i].r, 0, 2 * Math.PI);
				context.fill();
				context.closePath();
			}
		}
		////Apply Motion Blur
		draw.clearRect(0, 0, main.width, main.height);
		////Draw Background Image
		// draw.drawImage(arcsbackgroundimage, 0, 0, main.width, main.height);
		for(var i2 = 1; i2 <= frames.length; i2++) {
			var frame = frames[(frameIndex + i2) % frames.length];
			var alpha = (i2 / frames.length);
			if(i2 < frames.length) {
				alpha *= 0.35;
			}
			draw.globalAlpha = alpha;
			draw.drawImage(frame.main, 0, 0);
		}
		frameIndex = (frameIndex + 1) % frames.length;
	}catch(error) {
		PrepareMotionBlur();
	}
}

function PrepareMotionBlur() {
	frames = new Array();
	for(var i = 0; i < motionBlur; i++) {
		var frame = {
			main:document.createElement('canvas'),
		};
		frame.main.width = main.width;
		frame.main.height = main.height;
		frame.context = frame.main.getContext('2d');
		frames.push(frame);
	}
}

////////////////
////Calculation Functions
////////////////

function Vector2D(x, y) {
	this.x = x;
	this.y = y;
}

function Arc(position, r, speed, color, bounce, mass) {
	this.position = new Vector2D(position.x, position.y);
	this.r = r;
	this.speed = new Vector2D(speed.x, speed.y);
	this.color = color;
	this.bounce = bounce;
	this.mass = mass;
}

function Limits(min, max) {
	this.min = min;
	this.max = max;
}

function MoveArcs() {
	if(arcs0.length > 0) {
		var collidingArcs = CalculateCollisionArcs(arcs0);
		for(var arc0 in collidingArcs) {
			if(collidingArcs.hasOwnProperty(arc0)) {
				////Collision Position Correction
				if(inaccurateMode == 0) {
					var calculatedDifference = CalculateArcCollisionDifference(arcs0[arc0], arcs0[collidingArcs[arc0]]);
					arcs0[arc0].position.x -= calculatedDifference * arcs0[arc0].speed.x / VectorLength(arcs0[arc0].speed.x, arcs0[arc0].speed.y);
					arcs0[arc0].position.y -= calculatedDifference * arcs0[arc0].speed.y / VectorLength(arcs0[arc0].speed.x, arcs0[arc0].speed.y);
					arcs0[collidingArcs[arc0]].position.x -= calculatedDifference * arcs0[collidingArcs[arc0]].speed.x / VectorLength(arcs0[collidingArcs[arc0]].speed.x, arcs0[collidingArcs[arc0]].speed.y);
					arcs0[collidingArcs[arc0]].position.y -= calculatedDifference * arcs0[collidingArcs[arc0]].speed.y / VectorLength(arcs0[collidingArcs[arc0]].speed.x, arcs0[collidingArcs[arc0]].speed.y);
				}
				///Rotate Objects
				var phi = CalculatePhi(arcs0[arc0].position, arcs0[collidingArcs[arc0]].position);
				var arc0RotatedVelocity = CalculateRotation(arcs0[arc0].speed, phi);
				var arc1RotatedVelocity = CalculateRotation(arcs0[collidingArcs[arc0]].speed, phi);
				////Compute New Velocities
				var TotalRelativeVelocity = arc0RotatedVelocity.x - arc1RotatedVelocity.x;
				arc0RotatedVelocity.x = CalculateMassVelocity(arc0RotatedVelocity.x, arc1RotatedVelocity.x, arcs0[arc0].mass, arcs0[collidingArcs[arc0]].mass);
				arc1RotatedVelocity.x = TotalRelativeVelocity + arc0RotatedVelocity.x;
				////Rotate Objects Back
				arc0RotatedVelocity = CalculateRotation(arc0RotatedVelocity, -phi);
				arc1RotatedVelocity = CalculateRotation(arc1RotatedVelocity, -phi);
				////Write Back
				arcs0[arc0].speed = arc0RotatedVelocity;
				arcs0[collidingArcs[arc0]].speed = arc1RotatedVelocity;
			}
		}
		for(var i = 0; i < arcs0.length; i++) {
			var arc = arcs0[i];
			arc = CalculateCollisionWall(arc);
			arc = CalculateMove(arc);
			arcs0[i] = arc;
		}
	}
}

function CalculateCollisionWall(arc) {
	if(arc.position.y + arc.r >= main.height) {
		arc.speed.y *= -arc.bounce;
		arc.position.y -= 2*(arc.position.y + arc.r - main.height);
	}
	if(arc.position.y - arc.r <= 0) {
		arc.speed.y *= -arc.bounce;
		arc.position.y -= 2*(arc.position.y - arc.r);
	}
	if(arc.position.x + arc.r >= main.width) {
		arc.speed.x *= -arc.bounce;
		arc.position.x -= 2*(arc.position.x + arc.r - main.width);
	}
	if(arc.position.x - arc.r <= 0) {
		arc.speed.x *= -arc.bounce;
		arc.position.x -= 2*(arc.position.x - arc.r);
	}
	return arc;
}

function CalculateCollisionArcs(arcs) {
	var collidingArcs = {};
	for(var i = 1; i < arcs.length; i++) {
		var tempArc0 = arcs[i - 1];
		for(var i2 = i; i2 < arcs.length; i2++) {
			var tempArc1 = arcs[i2];
			var tempArc01AdditionR = tempArc0.r + tempArc1.r + arcDetectionAccuracy;
			if(VectorLength(tempArc0.position.x - tempArc1.position.x, tempArc0.position.y - tempArc1.position.y) <= tempArc01AdditionR) {
				collidingArcs[(i - 1).toString()] = i2.toString();
			}
		}
	}
	return collidingArcs;
}

function CalculatePhi(vect2D0, vect2D1) {
	return Math.atan2((vect2D0.y - vect2D1.y), (vect2D0.x - vect2D1.x));
}

function CalculateRotation(vect2D, phi) {
	var cosPhi = Math.cos(phi);
	var sinPhi = Math.sin(phi);
	return new Vector2D(vect2D.x * cosPhi + vect2D.y * sinPhi,
			    vect2D.y * cosPhi - vect2D.x * sinPhi);
}

function CalculateMassVelocity(vect2D0X, vect2D1X, mass0, mass1) {
	return ((mass0 - mass1) * vect2D0X + 2 * mass1 * vect2D1X) /
		(mass0 + mass1);
}

function CalculateMove(arc) {
	if(VectorLength((arc.speed.x * friction) + gravitation.x, (arc.speed.y * friction) + gravitation.y) >= 0.1) {
		arc.speed.x *= friction;
		arc.speed.y *= friction;
		arc.speed.x += gravitation.x;
		arc.speed.y += gravitation.y;
		arc.position.x += arc.speed.x;
		arc.position.y += arc.speed.y;
	}

	return arc;
}

function CalculateArcCollisionDifference(arc0, arc1) {
	var radiusDifferenceLength = VectorLength(arc0.position.x - arc1.position.x, arc0.position.y - arc1.position.y);
	var difference = ((arc0.r + arc1.r) - radiusDifferenceLength) / 2;
	//return new Vector2D(
	//		    (radiusDifferenceLength + (((arc0.speed.x * -1) / Math.abs(arc0.speed.x)) * difference)) / radiusDifferenceLength,
	//		    (radiusDifferenceLength + (((arc1.speed.x * -1) / Math.abs(arc0.speed.x)) * difference)) / radiusDifferenceLength
	//);
	return difference;
}

function GenerateColor() {
	var elements = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");
	var color = "#";
	for(var i = 0; i < 6; i++) {
		color += elements[parseInt((Math.random() * ((elements.length - 1) - 0)) + 0)];
	}
	return color;
}

function CalculateGravitation() {
	gravitation.x = (mousePosition.x - main.width / 2) / 1000;
	gravitation.y = (mousePosition.y - main.height / 2) / 1000;
}

function VectorLength(x, y) {
	return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

function CalculateBounce(radius) {
	return limitsBounce.max - ((radius - limitsRadius.min) / (limitsRadius.max - limitsRadius.min) * (limitsBounce.max - limitsBounce.min));
}

function CalculateMass(density, radius) {
	return density * Math.pow(radius, 2);
}

function VectorScalarMultiplication(vect0, scalar) {
	return new Vector2D(vect0.x * scalar, vect0.y * scalar);
}

main.addEventListener('mousemove', function(e) {
	mousePosition.x = e.clientX - main.getBoundingClientRect().left;
	mousePosition.y = e.clientY - main.getBoundingClientRect().top;
});

main.addEventListener('click', function() {
	var tempRadius = (Math.random() * (limitsRadius.max - limitsRadius.min)) + limitsRadius.min;
	arcs0.push(new Arc(mousePosition,
		tempRadius,
		new Vector2D((Math.random() * (limitsSpeedX.max - limitsSpeedX.min)) + limitsSpeedX.min, (Math.random() * (limitsSpeedY.max - limitsSpeedY.min)) + limitsSpeedY.min),
		GenerateColor(),
		CalculateBounce(tempRadius),
		CalculateMass(1, tempRadius)
	));
});
