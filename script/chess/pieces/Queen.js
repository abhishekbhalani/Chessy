/*
 *	Copyright (C) 2012 Andr� jr Steenveld all rights reserved
 *	Licensed under the MIT public license for the full license see the LICENSE file
 *
 */
define([ "..", ".", "lib", "./Piece" ], function( chess, pieces, lib, Piece ){

	pieces.Queen = lib.declare( [ Piece ], {
		type: "Queen",
		
		movement: function( ){
			return this.inherited( arguments, [[
				[ this.x, Infinity  ],
				[ this.x, -Infinity ],
				[ Infinity,  this.y ],
				[ -Infinity, this.y ],
				[  Infinity,  Infinity ],
				[ -Infinity, -Infinity ],
				[  Infinity, -Infinity ],
				[ -Infinity,  Infinity ] 
			]]);			
		}
	});
	
	return pieces.Queen;
});