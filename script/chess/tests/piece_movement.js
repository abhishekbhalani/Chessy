/*
 *	Copyright (C) 2012 Andr� jr Steenveld all rights reserved
 *	Licensed under the MIT public license for the full license see the LICENSE file
 *
 */
define([ "../", "lib", "doh" ], function( chess, lib, doh ){

function wrap_tests( tests ){

	Object.keys( tests ).forEach( function( key ){
	
		lib.aspect.before( tests, key, function( ){
			return [ new chess.board.Board({ }), { } ];		
		});
		
	});
	
	return tests;
}

var Piece = lib.declare( [ chess.pieces.Piece ], {
	
	type: "Piece",
	
	movement: function( ){
		return this.inherited( arguments, [[
			
			[ this.x, this.y + 1 ]
			
		]]);		
	}
	
});

doh.register(
	
	"Piece movement",
	
	wrap_tests({
	
		move_piece: function( board, pieces ){			
			pieces.piece = new Piece({
				color: "white",
				board: board,
				field: board.fields.d4
			});
			
			doh.is( true, pieces.piece === board.fields.d4.piece, "Piece is not at the D4" );
			
			doh.is( true, pieces.piece.move( board.fields.d5 ), "The move was unsuccessfull" );
			
			doh.is( false, pieces.piece === board.fields.d4.piece, "Piece is still at D4" );
			doh.is( true,  pieces.piece === board.fields.d5.piece, "Piece is not at D5" );
		},
		
		taking_piece: function( board, pieces ){
			pieces.white = new Piece({
				color: "white",
				board: board,
				field: board.fields.d4
			});
			
			pieces.black = new Piece({
				color: "black",
				board: board,
				field: board.fields.d5
			});
			
			doh.is( 2, board.piecesInPlay.length, "There are [ " + board.piecesInPlay.length + " ] in play." );
			
			doh.is( true, pieces.white.move( board.fields.d5 ), "The move was not successfull" );
			
			doh.is( false, pieces.black === board.fields.d5.piece, "The piece is still the black piece" );
			doh.is( true,  pieces.white === board.fields.d5.piece, "It's not the white piece on D5" );
			
			doh.is( false, pieces.black.inPlay, "Black piece is still in play" );
			doh.is( null,  pieces.black.field,  "Black piece is still on a field" );
			
			doh.is( 1, board.piecesInPlay.length, "There are still [ " + board.piecesInPlay.length + " ] in play" );
			doh.is( 1, board.piecesOutOfPlay.length, "There are [ " + board.piecesOutOfPlay.length + " ] out of play" );
		},
		
		illegal_move: function( board, pieces ){
			pieces.piece = new Piece({
				color: "white",
				board: board,
				field: board.fields.d4
			});
			
			doh.is( false, pieces.piece.move( board.fields.d6 ), "It was possible to make an illegal move" );			
			
		},
		
		pawn_moveing_into_en_passant: function( board, pieces ){
			
			pieces.bPawn = new chess.pieces.Pawn({
				color: "black",
				board: board,
				field: board.fields.a7
			});
			
			pieces.wPawn = new chess.pieces.Pawn({
				color: "white",
				board: board,
				field: board.fields.b5
			});
			
			doh.is( true, pieces.bPawn.move( board.fields.a5 ), "The move was unsuccessfull" );
			
			doh.t( -1 !== pieces.bPawn.attackedBy( ).indexOf( pieces.wPawn ), "Black pawn is not being attacked by white pawn." );
			doh.t( -1 !== pieces.wPawn.moves( ).indexOf( board.fields.a6 ), "White pawn can't move to A6." );
			
		},
		
		pawn_promotion: function( board, pieces ){
			
			throw "Test not implemented";
			
		},
		
		king_castleing_left: function( board, pieces ){
					
			pieces.king = new chess.pieces.King({ 
				color: "white", 
				board: board,
				field: board.fields.e1
			});
			
			pieces.rook = new chess.pieces.Rook({ 
				color: "white",
				board: board,
				field: board.fields.a1
			});
	
			doh.is( true, pieces.king.move( board.fields.c1 ), "Castleing move failed" );
			
			// Make sure the pieces have moved
			doh.is( true, null === board.fields.a1.piece, "The castle hasn't moved" );
			doh.is( true, null === board.fields.e1.piece, "The king hasn't moved" );
			
			// Make sure they are occupying the correct fields
			doh.is( true, board.fields.c1.piece === pieces.king, "The king is not occupying c1" );
			doh.is( true, board.fields.d1.piece === pieces.rook, "The rook is not occupying d1" );
			
			// Make sure the pieces know what field they are occupying
			doh.is( true, board.fields.c1 === pieces.king.field, "King doesn't know what field he is occupying" );
			doh.is( true, board.fields.d1 === pieces.rook.field, "Rook doesn't know what field he is occupying" );
			
		},
		
		king_castleing_right: function( board, pieces ){
			
			pieces.king = new chess.pieces.King({ 
				color: "white", 
				board: board,
				field: board.fields.e1
			});
			
			pieces.rook = new chess.pieces.Rook({ 
				color: "white",
				board: board,
				field: board.fields.h1				
			});
	
			doh.is( true, pieces.king.move( board.fields.g1 ), "Castleing move failed" );
			
			// Make sure the pieces have moved
			doh.is( true, null === board.fields.h1.piece, "The castle hasn't moved" );
			doh.is( true, null === board.fields.e1.piece, "The king hasn't moved" );
						
			// Make sure they are occupying the correct fields
			doh.is( true, board.fields.g1.piece === pieces.king, "The king is not occupying g1" );
			doh.is( true, board.fields.f1.piece === pieces.rook, "The rook is not occupying f1" );
			
			// Make sure the pieces know what field they are occupying
			doh.is( true, board.fields.g1 === pieces.king.field, "King doesn't know what field he is occupying" );
			doh.is( true, board.fields.f1 === pieces.rook.field, "Rook doesn't know what field he is occupying" );
			
		},
		
		king_not_castlering_because_it_already_did: function( board, pieces ){
			
			
			throw "Test not implemented"; 
			
		}
	})
);


});