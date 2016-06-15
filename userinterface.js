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
	GetUserData();
})();

function GetUserData() {
	////Motion Blur
	var oldUseMotionBlur = useMotionBlur;
	var newMotionBlur = parseInt(document.getElementById('motionbluramount').value);
	if(newMotionBlur < parseInt(document.getElementById('motionbluramount').min))
		newMotionBlur = parseInt(document.getElementById('motionbluramount').min);
	useMotionBlur = (document.getElementById('usemotionblur').checked) ? 1 : 0;
	if(oldUseMotionBlur != useMotionBlur) {
		if(useMotionBlur == 0) {
			document.getElementById("usemotionblur").checked = false;
			motionBlur = 1;
			document.getElementById("motionbluramount").value = motionBlur;
			PrepareMotionBlur();
		}else{
			document.getElementById.checked = true;
			motionBlur = 4;
			document.getElementById("motionbluramount").value = motionBlur;
			PrepareMotionBlur();
		}
	}
	if(motionBlur != newMotionBlur && useMotionBlur) {
		if(newMotionBlur.toString() == 'NaN' || newMotionBlur < 1) {
			motionBlur = 1;
			PrepareMotionBlur();
		}else{
			motionBlur = newMotionBlur;
			PrepareMotionBlur();
		}
	}
	////Gravitation
	if(document.getElementById('manualgravitationinputcheckbox').checked) {
		document.getElementById('manualgravitationinputx0').style.cssText = '';
		document.getElementById('manualgravitationinputx1').style.cssText = '';
		document.getElementById('manualgravitationinputy0').style.cssText = '';
		document.getElementById('manualgravitationinputy1').style.cssText = '';
		document.getElementById('cursorgravitationinput').style.cssText = 'display:none;';
		var gravitationX = parseFloat(document.getElementById('gravitationx').value);
		var gravitationY = parseFloat(document.getElementById('gravitationy').value);
		if(gravitationX.toString() == 'NaN')
			gravitationX = 0;
		if(gravitationY.toString() == 'NaN')
			gravitationY = 0;
		if(gravitation.x != gravitationX)
			gravitation.x = gravitationX;
		if(gravitation.y != gravitationY)
			gravitation.y = gravitationY;
	}
	////Friction
	var newFriction = parseFloat(document.getElementById('friction').value);
	if(newFriction.toString() == 'NaN')
		newFriction = 1;
	if(friction != newFriction)
		friction = newFriction;
	////Bounce
	var minBounce = parseFloat(document.getElementById('minbounce').value);
	var maxBounce = parseFloat(document.getElementById('maxbounce').value);
	if(minBounce.toString() == 'NaN')
		minBounce = 0.8;
	if(maxBounce.toString() == 'NaN')
		maxBounce = 0.99;
	if(minBounce < parseFloat(document.getElementById('minbounce').min))
		minBounce = 0.8;
	if(maxBounce < parseFloat(document.getElementById('maxbounce').min))
		maxBounce = 0.99;
	if(minBounce > maxBounce)
		minBounce = maxBounce;
	if(limitsBounce.min != minBounce)
		limitsBounce.min = minBounce;
	if(limitsBounce.max != maxBounce)
		limitsBounce.max = maxBounce;
	////Radius
	var minRadius = parseFloat(document.getElementById('minradius').value);
	var maxRadius = parseFloat(document.getElementById('maxradius').value);
	if(minRadius.toString() == 'NaN')
		minRadius = 4;
	if(maxRadius.toString() == 'NaN')
		maxRadius = 80;
	if(minRadius < parseFloat(document.getElementById('minradius').min))
		minRadius = parseFloat(document.getElementById('minradius').min);
	if(maxRadius < parseFloat(document.getElementById('maxradius').min))
		maxRadius = parseFloat(document.getElementById('maxradius'));
	if(minRadius > maxRadius)
		minRadius = maxRadius;
	if(limitsRadius.min != minRadius)
		limitsRadius.min = minRadius;
	if(limitsRadius.max != maxRadius)
		limitsRadius.max = maxRadius;
	////Speed
	var minSpeedX = parseFloat(document.getElementById('minspeedx').value);
	var maxSpeedX = parseFloat(document.getElementById('maxspeedx').value);
	var minSpeedY = parseFloat(document.getElementById('minspeedy').value);
	var maxSpeedY = parseFloat(document.getElementById('maxspeedy').value);
	if(minSpeedX.toString() == 'NaN')
		minSpeedX = -20;
	if(maxSpeedX.toString() == 'NaN')
		maxSpeedX = 20;
	if(minSpeedY.toString() == 'NaN')
		minSpeedY = -20;
	if(maxSpeedY.toString() == 'NaN')
		maxSpeedY = 20;
	if(minSpeedX > maxSpeedX)
		minSpeedX = maxSpeedX;
	if(minSpeedY > maxSpeedY)
		minSpeedY = maxSpeedY;
	if(limitsSpeedX.min != minSpeedX)
		limitsSpeedX.min = minSpeedX;
	if(limitsSpeedX.max != maxSpeedX)
		limitsSpeedX.max = maxSpeedX;
	if(limitsSpeedY.min != minSpeedY)
		limitsSpeedY.min = minSpeedY;
	if(limitsSpeedY.max != maxSpeedY)
		limitsSpeedY.max = maxSpeedY;
	////Collision Detection
	var newArcDetectionAccuracy = parseFloat(document.getElementById('arcdetectionaccuracy').value);
	if(newArcDetectionAccuracy.toString() == 'NaN')
		newArcDetectionAccuracy = 0;
	if(newArcDetectionAccuracy < parseFloat(document.getElementById('arcdetectionaccuracy').min))
		newArcDetectionAccuracy = parseFloat(document.getElementById('arcdetectionaccuracy').min);
	if(arcDetectionAccuracy != newArcDetectionAccuracy)
		arcDetectionAccuracy = newArcDetectionAccuracy;
}

function PreferencesReset(ids, values) {
	for(var i = 0; i < ids.length; i++) {
		if(values[i] == 'false') {
			document.getElementById(ids[i]).checked = false;
		}else if(values[i] == 'true') {
			document.getElementById(ids[i]).checked = true;
		}else if(values[i] == 'reset') {
			document.getElementById('cursorgravitationinput').style.cssText = '';
			document.getElementById('manualgravitationinputx0').style.cssText = 'display:none;';
			document.getElementById('manualgravitationinputx1').style.cssText = 'display:none;';
			document.getElementById('manualgravitationinputy0').style.cssText = 'visibility:hidden;';
			document.getElementById('manualgravitationinputy1').style.cssText = 'visibility:hidden;';
		}else if(values[i] == 'inaccuratecollision') {
			ChangeCollisionMode(0);
		}else{
			document.getElementById(ids[i]).value = values[i];
		}
	}
}

function ArcsReset() {
	arcs0 = new Array();
}

function AllReset(arcs, preferences) {
	if(arcs == 1) {
		ArcsReset();
	}
	if(preferences == 1) {
		PreferencesReset(new Array('usemotionblur', 'motionbluramount', 'manualgravitationinputcheckbox', 'manualgravitationinput', 'gravitationx', 'gravitationy', 'friction', 'minbounce', 'maxbounce', 'minradius', 'maxradius', 'minspeedx', 'maxspeedx', 'minspeedy', 'maxspeedy', 'arcdetectionaccuracy', 'inaccuratecollision'), new Array('true', '4', 'false', 'reset', '0', '0', '1', '0.8', '0.99', '4', '80', '-20', '20', '-20', '20', '0', 'inaccuratecollision'));
	}
}

function ChangeCollisionMode(accuracy) {
	inaccurateMode = accuracy;
	if(inaccurateMode == 0) {
		document.getElementById('accuratecollision').style.cssText = '';
		document.getElementById('inaccuratecollision').style.cssText = 'display:none;';
	}else{
		document.getElementById('inaccuratecollision').style.cssText = '';
		document.getElementById('accuratecollision').style.cssText = 'display:none;';
	}
}
