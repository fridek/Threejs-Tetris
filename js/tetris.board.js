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
	
	for(x = 0; x < fields.length; x++) {
		for(y = 0; y < fields[0].length; y++) {
			for(z = 0; z < fields[0][0].length; z++) {
				if(fields[x][y][z] == -1) fields[x][y][z] = 0;
			}				
		}
	}
	
	var posx = block.position.x, posy = block.position.y, posz = block.position.z;
	
	for(y = 0 ; y < block.shape.length; y++) {
		for(x = 0 ; x < block.shape[0].length; x++) {
			if(block.shape[y][x] == 0) continue;
			
			if((x+posx) < 0 || (y+posy) < 0 || (x+posx) >= fields.length || (y+posy) >= fields[0].length) {
				return Tetris.Board.COLLISION_WALL;
			}
			
			if(fields[x+posx][y+posy][posz] == 1 || posz < 0) {
				return Tetris.Board.COLLISION_GROUND;
			}
			
			Tetris.Board.fields[x+posx][y+posy][posz] = -1;
		}
	}
}

Tetris.Board.checkCompleted = function() {
	var x,y,z,x2,y2,z2, fields = Tetris.Board.fields;
	var rebuild = false;

	var sum, expected = fields[0].length*fields.length;
	
	for(z = 0; z < fields[0][0].length; z++) {
		sum = 0;
		for(y = 0; y < fields[0].length; y++) {
			for(x = 0; x < fields.length; x++) {
				if(fields[x][y][z] == 1) sum++;
			}				
		}

		if(sum == expected) {
			
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
	return rebuild;
}
