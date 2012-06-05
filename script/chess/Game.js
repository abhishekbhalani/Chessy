/*
 *	Copyright (C) 2012 Andr� jr Steenveld all rights reserved
 *	Licensed under the MIT public license for the full license see the LICENSE file
 *
 */
define( [ ".", "lib" ], function( chess, lib ){
	
	chess.Game = lib.declare( [ lib.Evented ], {
		color: null,
		
		board: null,
		
		white: null,
		black: null,
		
		constructor: function( _game_ ){
			var board = this.board = _game_.board;
					
			lib.aspect.after( board, "place", this._placeHandler.bind( this ), true );
			
			Object.keys( board.fieldsByName ).forEach( 
				Function.bind( this, function( name ){
				
					var field = board.fieldsByName[ name ];							
					lib.aspect.around( field, "occupy", this._occupyHandler.bind( this, field ) );
				
				})
			);
						
			"white" in _game_ && _game_.white.join( this, "white" );
			"black" in _game_ && _game_.black.join( this, "black" );			
			
			"color" in _game_ && ( this.color = _game_.color );
		},
		
		turn: function( ){ 
			return this.color && this.color === "white"
				? ( this.color = "black" )
				: ( this.color = "white" );	
		},
		
		start: function( ){
			if(
				   this.white && this.white.isInstanceOf( chess.Player )
				&& this.black && this.black.isInstanceOf( chess.Player )				
			){
				
				this.color || this.turn( );			
				this.emit.onIdle( this, [ "Start", { color: this.color } ] );
				this[ this.color ].turn.onIdle( this[ this.color ] );
				
			} else {
				
				console.warn( "Game#start :: Not enough players to start the game" );
				
			}
		},
		
		end: function( conditions ){
			if( conditions.result === "check mate" ){
				this.emit.onIdle( this, [ "checkMate", {
					winner: conditions.winner,
					loser:  conditions.loser
				}]);
				
			} else if( conditions.result === "surrender" ){
				this.emit.onIdle( this, [ "surrender", {
					winner: conditions.winner,
					loser:  conditions.loser
				}]);
				
			} else if( conditions.result === "stale mate" ){
				this.emit.onIdle( this, [ "staleMate", {
					winner: conditions.winner,
					loser:  conditions.loser
				}]);
				
			} else if( conditions.result === "draw" ){
				this.emit.onIdle( this, [ "draw" ] );					
				
			}
			
			this.emit.onIdle( this, [ "end", { result: conditions.result } ] );			
		},
		
		//
		// Handlers for the place and occupy methods from the board
		//
		_placeHandler: function( field, piece ){ 
			this.emit.onIdle( this, [ "Placed", {
				field: field,
				piece: piece
			}]);
		},
		
		_occupyHandler: function( field, occupy ){ 
			return Function.bind( this, function( piece ){
				// Check if the piece is still on the board, if not it was hit.
				piece.field && this.emit.onIdle( this, [ "Moved", {
					occupant: field.piece, // The current puece on the field
					piece:    piece,       // The piece we are moving
					from:     piece.field, // Where did the moving piece come from
					to:       field        // Where are we going?
				});			
				
				return occupy.call( field, piece );
			});
		},
		
				
		//
		// Game events
		//
		onPlaced: function( _placed_ ){ /* When a piece is placed on the board (setup or pawn promotion) */ },
				
		onMoved: function( _moved_ ){ 
			if( !this.white || !this.black ){ return; }
			
			var color     = this.turn( ),
				turnEvent = color === "white"
					? "WhiteTurn"
					: "BlackTurn";

			if( this.board.isStaleMate( color ) ){
			
				this.emit.onIdle( this, [ "StaleMate" ] )
					.then( this.emit.async( this, [ "Draw", { /* game result... */ } ] ) )
					.then( this.emit.async( this, [ "End",  { /* game result... */ } ] ) );
				
			} else if( this.board.isCheckMate( color ) ){
				
				this.emit.onIdle( this, [ "CheckMate" ] )
					.then( this.emit.async( this, [ "End", { /* game result... */ } ] ) );
							
			} else if( this.board.isCheck( color ) ){
				
				this.emit.onIdle( this, [ "Check", /* turn */ ] )
					.then( this.emit.async( this, [ "turn for player", { /* turn */ } ] ) );
							
			} else {
				
				this.emit.onIdle( this, [ "turn for player", [ /* turn */ } ] ) );
				
			}
			
		},
			
		onWhiteTurn: function( _turn_ ){ /* The white player recieved the turn */ },
		
		onBlackTurn: function( _turn_ ){ /* The black player recieced the turn */ },
						
		onCheck: function( _turn_ ){ /* Fired when any player is checked */ },
		
		onStaleMate: function( _result_ ){ /* Fired when there is a stale mate, fired before the onEnd event */ },
		
		onCheckMate: function( _result_ ){ /* Fired when eiter player is mated, fired before the onEnd event */ ,
		
		onSurrender: function( _result_ ){ /* Fired when a player surrenders the match, fired before the onEnd event */ },
						
		onStart: function( ){ /* Fired when a game is started */ },
		
		onDraw: function( _result_ ){ /* Fired when a game ended in a draw, fired before the onEnd event */ },
		
		onEnd: function( _result_ ){ /* Fired when the game has eneded */ },
		
		onPlayerJoin: function( _newPlayer_ ){ /* When a player joins the game */},
		
		onPlayerLeave: function( ){ /* When a player leaves and the the game wasn't started */ },
		
		//
		// Actions
		//
		join: function( player, color ){ 
			// We already have 2 players, or the preferred color is already taken...
			if( ( color && this[ color ] ) || ( this.black && this.white ) ){ 
				return null; 	
			}
			
			// Decide what color we are going to use
			color || ( color = ~~( Math.random( ) * 10 ) % 2 ? "white" : "black" );
			this[ color ] = player;
						
			this.emit.onIdle( this, [ "PlayerJoin", { color: color, player: player } ] );
			
			return color;
		},
		
		leave: function( player ){ 
			this[ player.color ] = null;
			this.emit.onIdle( this, [ "PlayerLeave", { player: player } ] );
		}
	});

	return chess.Game;
});