window.Tetris = window.Tetris  || {};
Tetris.Block = {};

Tetris.Block.shapes = [
	[
		{x: 0, y: 0, z: 0},
		{x: 1, y: 0, z: 0},
		{x: 1, y: 1, z: 0},
		{x: 1, y: 2, z: 0}
	],
	[
		{x: 0, y: 0, z: 0},
		{x: 0, y: 1, z: 0},
		{x: 0, y: 2, z: 0},
		{x: 0, y: 3, z: 0}
	],
	[
		{x: 0, y: 0, z: 0},
		{x: 0, y: 1, z: 0},
		{x: 1, y: 0, z: 0},
		{x: 1, y: 1, z: 0}
	],
	[
		{x: 0, y: 0, z: 0},
		{x: 0, y: 1, z: 0},
		{x: 0, y: 2, z: 0},
		{x: 1, y: 1, z: 0}
	],
	[
		{x: 0, y: 0, z: 0},
		{x: 0, y: 1, z: 0},
		{x: 1, y: 1, z: 0},
		{x: 1, y: 2, z: 0}
	]/*,
	[
		[1,1,1,1,1],
		[1,1,1,1,1],
		[1,1,1,1,1],
		[1,1,1,1,1],
		[1,1,1,1,1]
	]*/
];

Tetris.Block.position = {};
Tetris.Block.rotation = {};

Tetris.Block.generate = function() {
	var geometry, tmpGeometry;
	
	var type = Math.floor(Math.random()*(Tetris.Block.shapes.length));
	
	// var type = 5;
	
	var shape = Tetris.Block.shapes[type];
	Tetris.Block.shape = [];
	for(var i = 0; i < Tetris.Block.shapes[type].length; i++) {
		Tetris.Block.shape[i] = {x: Tetris.Block.shapes[type][i].x, y: Tetris.Block.shapes[type][i].y, z: Tetris.Block.shapes[type][i].z};
	}
	
	geometry = new THREE.CubeGeometry( Tetris.blockSize, Tetris.blockSize, Tetris.blockSize);
	for(var i = 1 ; i < shape.length; i++) {
		tmpGeometry = new THREE.Mesh(new THREE.CubeGeometry( Tetris.blockSize, Tetris.blockSize, Tetris.blockSize));
		tmpGeometry.position.x = Tetris.blockSize * shape[i].x;
		tmpGeometry.position.y = Tetris.blockSize * shape[i].y;
		THREE.GeometryUtils.merge(geometry, tmpGeometry);
	}

	Tetris.Block.mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [
		new THREE.MeshBasicMaterial({color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true}),
		new THREE.MeshBasicMaterial({color: 0xff0000}) 
	]);
	
	// initial position
	Tetris.Block.position = {x: Math.floor(Tetris.boundingBoxConfig.splitX/2)-1, y: Math.floor(Tetris.boundingBoxConfig.splitY/2)-1, z: 15};
	Tetris.Block.rotation = {x: 0, y: 0, z: 0};
	
	Tetris.Block.mesh.position.x = (Tetris.Block.position.x - Tetris.boundingBoxConfig.splitX/2)*Tetris.blockSize/2;
	Tetris.Block.mesh.position.y = (Tetris.Block.position.y - Tetris.boundingBoxConfig.splitY/2)*Tetris.blockSize/2;
	Tetris.Block.mesh.position.z = (Tetris.Block.position.z - Tetris.boundingBoxConfig.splitZ/2)*Tetris.blockSize + Tetris.blockSize/2;
	Tetris.Block.mesh.overdraw = true;

	
	var collision = Tetris.Board.moveBlock(Tetris.Block);
	
	if(collision == Tetris.Board.COLLISION_GROUND) {
		Tetris.gameOver = true;
		Tetris.sounds["gameover"].play();
		Tetris.pointsDOM.innerHTML = "GAME OVER";
		Cufon.replace('#points');		
	}
	
	Tetris.scene.add(Tetris.Block.mesh);
}

Tetris.Block.stepForward = function() {
	Tetris.Block.mesh.position.z -= Tetris.blockSize;
	Tetris.Block.position.z -= 1;
	
	var collision = Tetris.Board.moveBlock(Tetris.Block);

	if(collision == Tetris.Board.COLLISION_GROUND) {
		Tetris.sounds["collision"].play();
		Tetris.Block.position.z += 1;
		Tetris.Block.hitBottom();
		
		if(Tetris.Board.checkCompleted()) {
			var fields = Tetris.Board.fields;
			
			for(var z = 0; z < fields[0][0].length-1; z++) {
				for(var y = 0; y < fields[0].length; y++) {
					for(var x = 0; x < fields.length; x++) {
						if(fields[x][y][z] == 1 && !Tetris.staticBlocks[x][y][z]) {
							Tetris.addStaticBlock(x,y,z);
						}
						if(fields[x][y][z] == 0 && Tetris.staticBlocks[x][y][z]) {
							Tetris.scene.removeObject(Tetris.staticBlocks[x][y][z]);
							Tetris.staticBlocks[x][y][z] = undefined;
						}
					}				
				}
			}				
		}		
	} else {
		Tetris.sounds["move"].play();
	}
	// return hit the bottom
}

Tetris.Block.rotate = function(x,y,z) {
	Tetris.Block.mesh.rotation.x += x * Math.PI / 180;
	Tetris.Block.mesh.rotation.y += y * Math.PI / 180;
	Tetris.Block.mesh.rotation.z += z * Math.PI / 180;

	Tetris.Block.rotation.x = (Tetris.Block.rotation.x + x + 360)%360;
	Tetris.Block.rotation.y = (Tetris.Block.rotation.y + y + 360)%360;
	Tetris.Block.rotation.z = (Tetris.Block.rotation.z + z + 360)%360;

	var shape = Tetris.Block.shape, newshape;
	
	function swap(x, y, z) {
		return {x: x, y: y, z: z};
	}
	
	for(var i = 0 ; i < shape.length; i++) {
		newshape = {x: shape[i].x, y: shape[i].y, z: shape[i].z};
		switch(x) {
			case 0:
			break;
			case 90:
				newshape = swap(newshape.x, -1*newshape.z, newshape.y);
			break;
			case -90:
				newshape = swap(newshape.x, newshape.z, -1*newshape.y);
			break;
		}
		switch(y) {
			case 0:
			break;
			case 90:
				newshape = swap(newshape.z, newshape.y, -1*newshape.x);
			break;
			case -90:
				newshape = swap(-1*newshape.z, newshape.y, newshape.x);
			break;
		}
		switch(z) {
			case 0:
			break;
			case 90:
				newshape = swap(-1*newshape.y, newshape.x, newshape.z);
			break;
			case -90:
				newshape = swap(newshape.y, -1*newshape.x, newshape.z);
			break;
		}
		Tetris.Block.shape[i] = newshape;
	}

	var collision = Tetris.Board.moveBlock(Tetris.Block);
	if(collision == Tetris.Board.COLLISION_WALL) {
		Tetris.Block.rotate(-x,-y,-z); //oh laziness
	}
}

Tetris.Block.move = function(x,y,z) {
	if(x) {
		Tetris.Block.mesh.position.x += x;
		Tetris.Block.position.x += x>0?1:-1;
	}
	if(y) {
		Tetris.Block.mesh.position.y += y;
		Tetris.Block.position.y += y>0?1:-1;
	}
	if(z) {
		Tetris.Block.stepForward();
	}	
	
	var collision = Tetris.Board.moveBlock(Tetris.Block);
	if(collision == Tetris.Board.COLLISION_WALL) {
		if(x) {
			Tetris.Block.mesh.position.x -= x;
			Tetris.Block.position.x -= x>0?1:-1;
		}
		if(y) {
			Tetris.Block.mesh.position.y -= y;
			Tetris.Block.position.y -= y>0?1:-1;	
		}
	}
}

/**
* call when hits the floor and should be transformed to static blocks
*/
Tetris.Block.petrify = function() {
	var shape = Tetris.Block.shape;
	for(var i = 0 ; i < shape.length; i++) {
		Tetris.addStaticBlock(Tetris.Block.position.x + shape[i].x, Tetris.Block.position.y + shape[i].y, Tetris.Block.position.z + shape[i].z);
		Tetris.Board.fields[Tetris.Block.position.x + shape[i].x][Tetris.Block.position.y + shape[i].y][Tetris.Block.position.z + shape[i].z] = 1;
	}
}

Tetris.Block.hitBottom = function() {
	this.petrify();
	
	Tetris.scene.removeObject(Tetris.Block.mesh);
	Tetris.Block.generate();
}
