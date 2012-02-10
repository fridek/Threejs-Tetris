if ( !window.requestAnimationFrame ) {

  window.requestAnimationFrame = ( function() {

	  return window.webkitRequestAnimationFrame ||
	  window.mozRequestAnimationFrame ||
	  window.oRequestAnimationFrame ||
	  window.msRequestAnimationFrame ||
	  function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

		  window.setTimeout( callback, 1000 / 60 );

	  };
	})();
}

THREE.Matrix4.prototype.round = function() {
  this.n11 = Math.round(this.n11);
  this.n12 = Math.round(this.n12);
  this.n13 = Math.round(this.n13);
  this.n14 = Math.round(this.n14);
  this.n21 = Math.round(this.n21);
  this.n22 = Math.round(this.n22);
  this.n23 = Math.round(this.n23);
  this.n24 = Math.round(this.n24);
  this.n31 = Math.round(this.n31);
  this.n32 = Math.round(this.n32);
  this.n33 = Math.round(this.n33);
  this.n34 = Math.round(this.n34);
  this.n41 = Math.round(this.n41);
  this.n42 = Math.round(this.n42);
  this.n43 = Math.round(this.n43);
  this.n44 = Math.round(this.n44);
};

var Tetris = {};
Tetris.sounds = {};

Tetris.init = function() {
	Tetris.sounds["theme"] = document.getElementById("audio_theme");  
	Tetris.sounds["collision"] = document.getElementById("audio_collision");  
	Tetris.sounds["move"] = document.getElementById("audio_move");  
	Tetris.sounds["gameover"] = document.getElementById("audio_gameover");  
  Tetris.sounds["score"] = document.getElementById("audio_score");  
	
	Tetris.sounds["theme"].play();

	// set the scene size
	var WIDTH = window.innerWidth,
	    HEIGHT = window.innerHeight;

	// set some camera attributes
	var VIEW_ANGLE = 45,
	    ASPECT = WIDTH / HEIGHT,
	    NEAR = 0.1,
	    FAR = 10000;

	// create a WebGL renderer, camera
	// and a scene
	Tetris.renderer = new THREE.WebGLRenderer();
	Tetris.camera = new THREE.PerspectiveCamera(  VIEW_ANGLE,
	                                ASPECT,
	                                NEAR,
	                                FAR  );
	Tetris.scene = new THREE.Scene();

	// the camera starts at 0,0,0 so pull it back
	Tetris.camera.position.z = 400;
	Tetris.scene.add(Tetris.camera);

	// start the renderer
	Tetris.renderer.setSize(WIDTH, HEIGHT);

	// attach the render-supplied DOM element
	document.body.appendChild(Tetris.renderer.domElement);

	var boundingBoxConfig = {
		width: 360,
		height: 360,
		depth: 1200,
		splitX: 6,
		splitY: 6,
		splitZ: 20
	};
	Tetris.boundingBoxConfig = boundingBoxConfig;
	Tetris.blockSize = boundingBoxConfig.width/boundingBoxConfig.splitX;
	
	var boundingBox = new THREE.Mesh(
		new THREE.CubeGeometry(boundingBoxConfig.width, boundingBoxConfig.height, boundingBoxConfig.depth, boundingBoxConfig.splitX, boundingBoxConfig.splitY, boundingBoxConfig.splitZ, [], true), 
		new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } )
		);
	Tetris.scene.add(boundingBox);

	// create a point light
	var pointLight = new THREE.PointLight( 0xFFFFFF );

	// set its position
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 130;
	
	// add to the scene
	Tetris.scene.add(pointLight);

	Tetris.stats = new Stats();
	Tetris.stats.domElement.style.position = 'absolute';
	Tetris.stats.domElement.style.top = '10px';
	Tetris.stats.domElement.style.left = '10px';
	document.body.appendChild( Tetris.stats.domElement );

	Tetris.Board.init(boundingBoxConfig.splitX, boundingBoxConfig.splitY, boundingBoxConfig.splitZ);
	Tetris.renderer.render(Tetris.scene, Tetris.camera);
	
	// Tetris.addCameraListeners();
	
	document.getElementById("play_button").addEventListener('click', function (event) {
		event.preventDefault();
		Tetris.start();
	});
};

Tetris.gameStepTime = 1000;

Tetris.frameTime = 0; // ms
Tetris.cumulatedFrameTime = 0; // ms
Tetris._lastFrameTime = Date.now(); // timestamp

Tetris.pointsDOM;
Tetris.start = function() {
	document.getElementById("menu").style.display = "none";
	Tetris.pointsDOM = document.getElementById("points");
	Tetris.pointsDOM.style.display = "block";
	
	Tetris.sounds["theme"].pause();
	Tetris.Block.generate();
	Tetris.animate();
};

Tetris.gameOver = false;
Tetris.animate = function() {
//	Tetris.camera.rotation.x = Tetris.orbitX;
//	Tetris.camera.rotation.y = Tetris.orbitY;
	
	var time = Date.now();
	Tetris.frameTime = time - Tetris._lastFrameTime;
	Tetris._lastFrameTime = time;
	Tetris.cumulatedFrameTime += Tetris.frameTime;

	while(Tetris.cumulatedFrameTime > Tetris.gameStepTime) {
		Tetris.cumulatedFrameTime -= Tetris.gameStepTime;
		Tetris.Block.stepForward();
	}
	
	Tetris.renderer.render(Tetris.scene, Tetris.camera);
	
	Tetris.stats.update();
	
	if(!Tetris.gameOver) window.requestAnimationFrame(Tetris.animate);
}


// nice test:
//var i = 0, j = 0, k = 0, interval = setInterval(function() {if(i==10) {i=0;j++;} if(j==10) {j=0;k++;} if(k==10) {clearInterval(interval); return;} Tetris.addStaticBlock(i,j,k); i++;},30)

Tetris.staticBlocks = [];
Tetris.zColors = [
	0x6666ff, 0x66ffff, 0xcc68EE, 0x666633, 0x66ff66, 0x9966ff, 0x00ff66, 0x66EE33, 0x003399, 0x330099, 0xFFA500, 0x99ff00, 0xee1289, 0x71C671, 0x00BFFF, 0x666633, 0x669966, 0x9966ff
];
Tetris.addStaticBlock = function(x,y,z) {
	if(Tetris.staticBlocks[x] == undefined) Tetris.staticBlocks[x] = [];
	if(Tetris.staticBlocks[x][y] == undefined) Tetris.staticBlocks[x][y] = [];

	var mesh = THREE.SceneUtils.createMultiMaterialObject(new THREE.CubeGeometry( Tetris.blockSize, Tetris.blockSize, Tetris.blockSize), [
		new THREE.MeshBasicMaterial({color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true}),
		new THREE.MeshBasicMaterial({color: Tetris.zColors[z]}) 
	] );
	
	mesh.position.x = (x - Tetris.boundingBoxConfig.splitX/2)*Tetris.blockSize + Tetris.blockSize/2;
	mesh.position.y = (y - Tetris.boundingBoxConfig.splitY/2)*Tetris.blockSize + Tetris.blockSize/2;
	mesh.position.z = (z - Tetris.boundingBoxConfig.splitZ/2)*Tetris.blockSize + Tetris.blockSize/2;
	mesh.overdraw = true;
	
	Tetris.scene.add(mesh);	
	Tetris.staticBlocks[x][y][z] = mesh;
};


Tetris.currentPoints = 0;
Tetris.addPoints = function(n) {
	Tetris.currentPoints += n;
	Tetris.pointsDOM.innerHTML = Tetris.currentPoints;
	Cufon.replace('#points');
}

window.addEventListener('keydown', function (event) {
	var key = event.which ? event.which : event.keyCode;

	switch(key) {
		//case 

		case 38: // up (arrow)
			Tetris.Block.move(0, Tetris.blockSize, 0);
			break;
		case 40: // down (arrow)
			Tetris.Block.move(0, -1*Tetris.blockSize, 0);
			break;
		case 37: // left(arrow)
			Tetris.Block.move(-1*Tetris.blockSize, 0, 0);
			break;
		case 39: // right (arrow)
			Tetris.Block.move(Tetris.blockSize, 0, 0);
			break;	
		case 32: // space
			Tetris.Block.move(0, 0, -1*Tetris.blockSize);
			break;
			
		case 87: // up (w)
			
			Tetris.Block.rotate(90, 0, 0);
			break;
		case 83: // down (s)
			
			Tetris.Block.rotate(-90, 0, 0);
			break;
		case 65: // left(a)
			Tetris.Block.rotate(0, 0, 90);
			break;
		case 68: // right (d)
			Tetris.Block.rotate(0, 0, -90);
			break;	

		case 81: // (q)
			Tetris.Block.rotate(0, 90, 0);
			break;
		case 69: // (e)	
			Tetris.Block.rotate(0, -90, 0);
			break;
			

	}
}, false);	

