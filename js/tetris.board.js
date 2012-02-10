window.Tetris = window.Tetris  || {};
Tetris.Board = {};

Tetris.Board.COLLISION_WALL = 1;
Tetris.Board.COLLISION_GROUND = 2;

Tetris.Board.fields = [];

Tetris.Board.init = function(_x,_y,_z) {
	for(var x = 0; x < _x; x++) {
		Tetris.Board.fields[x] = [];
		for(var y = 0; y < _y; y++) {
			Tetris.Board.fields[x][y] = [];		
			for(var z = 0; z < _z; z++) {
				Tetris.Board.fields[x][y][z] = 0;	
			}				
		}
	}
};

Tetris.Board.moveBlock = function(block) {
	var x,y,z;
	
	var fields = Tetris.Board.fields;
	var posx = block.position.x, posy = block.position.y, posz = block.position.z, shape = block.shape;

	for(var i = 0 ; i < shape.length; i++) {
		if((shape[i].x+posx) < 0 || (shape[i].y+posy) < 0 || (shape[i].x+posx) >= fields.length || (shape[i].y+posy) >= fields[0].length) {
			return Tetris.Board.COLLISION_WALL;
		}
		
		if(fields[shape[i].x+posx][shape[i].y+posy][shape[i].z+posz+1] == 1) {
			return Tetris.Board.COLLISION_WALL;
		}
		
		if(fields[shape[i].x+posx][shape[i].y+posy][shape[i].z+posz] == 1 || (shape[i].z+posz) < 0) {
			return Tetris.Board.COLLISION_GROUND;
		}
	}

}

Tetris.Board.checkCompleted = function() {
	var x,y,z,x2,y2,z2, fields = Tetris.Board.fields;
	var rebuild = false;

	var sum, expected = fields[0].length*fields.length, bonus = 0;
	
	for(z = 0; z < fields[0][0].length; z++) {
		sum = 0;
		for(y = 0; y < fields[0].length; y++) {
			for(x = 0; x < fields.length; x++) {
				if(fields[x][y][z] == 1) sum++;
			}				
		}

		if(sum == expected) {
			bonus++;
			
			for(y2 = 0; y2 < fields[0].length; y2++) {
				for(x2 = 0; x2 < fields.length; x2++) {
					for(z2 = z; z2 < fields[0][0].length-1; z2++) {
						Tetris.Board.fields[x2][y2][z2] = fields[x2][y2][z2+1];
					}
					Tetris.Board.fields[x2][y2][fields[0][0].length-1] = 0;
				}				
			}
			rebuild = true;
		}
	}
	if(bonus) {
		Tetris.addPoints(1000 * bonus);
    Tetris.sounds["score"].play();
	}
	return rebuild;
}
