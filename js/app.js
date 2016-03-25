/* Reversi!
 *
 * Playable Spaces:
 * 8 * 32px = 256px
 * Plus the border, 1 space around the board:
 * 10 * 32px = 320px
 */

/* Helper Functions and global variables
 */
var isGameOver = false;
var isReady = false; // Is user ready for a new game

// Send these to the canvas variable in the Engine
var CANVAS_WIDTH = 320;
var CANVAS_HEIGHT = 320;

// Define gameboard for canvas
var NUM_ROWS = 10;
var NUM_COLS = 10;
var space = {
	'height' : CANVAS_HEIGHT / NUM_ROWS,
	'width' : CANVAS_WIDTH / NUM_COLS
};

// Playble gameboard
var board = {
	'rows' : 8,
	'cols' : 8,
	'spaces' : new Array(this.rows)
};

// Hold turn (by player piece color)
var turn;

// Holds move request
var moveRequest = {};

// Waits for mouse clicks and sends the info moveRequest variable
document.addEventListener("mouseup", function(event) {
	var x = event.x;
	var y = event.y;

	var canvas = this.getElementById("myCanvas");

	x -= (canvas.offsetLeft + space.width);
	y -= (canvas.offsetTop + space.height);

	// Translate move into whole space numbers on the board
	moveRequest = {
		'x' : Math.floor(x / space.width),
		'y' : Math.floor(y / space.height)
	};
}, false);

function initBoard() {
	// Inititalize matrix size
	for (var row = 0; row < board.rows; row++) {
		board.spaces[row] = new Array(board.cols);
	}

	// Set middle four pieces to starting positions
	board.spaces[3][3] = 'white';
	board.spaces[4][4] = 'white';
	board.spaces[3][4] = 'black';
	board.spaces[4][3] = 'black';
}

/**
 * Player Class, which will hold name, color, score and piece matrix
 * @constructor
 * @param {string} name - The name of the player.
 * @param {string} color - The player's (chosen) color. Must be black or white
 */
var Player = function(name, color) {
	this.name = name;
	this.color = color;
	this.sprite = {
		'img' : 'images/checker.png',
		'x' : (this.color === 'black') ? 0 : 32,
		'y' : 32 };
	this.pieces = [];
}

// Update player's pieces
Player.prototype.update = function(dt) {
	// Check that it's our turn
	if (turn === this.color) {
		this.handleInput(moveRequest);
	};
};

// Account for user input
Player.prototype.handleInput = function(move) {
	// Check if move is in bounds
	if (move.x < board.cols &&
		move.x >= 0 &&
		move.y < board.rows &&
		move.y >= 0) {
		//Check if move is legal
		if (this.isALegalMove(move)) {
			// Place user token in spot
			board.spaces[move.x][move.y] = this.color;

			// Advance turn once move has been taken
			turn = (turn === 'white') ? 'black' : 'white';
		}
	}
};

// Finds if move is allowed under the rules of reversi
Player.prototype.isALegalMove = function(move) {
	// Establish which color piece to look for a match for
	var myToken = turn;
	var targetToken = (turn === 'black') ? 'white' : 'black';

	// TODO: This section seems it could be more DRY
	// Search Up
	// If space above has a piece of the opponent's color
	if (board.spaces[move.x][move.y - 1] === targetToken) {
		// Look up each space until the top of the board for one of my pieces
		for (var space = move.y - 2; space >= 0; space--) {
			// If my piece is found return true; there's at least 1 legal move
			if (board.spaces[move.x][space] === myToken) {
				return true;
			}
		}
	}

	// Search Down
	// If space below has a piece of the opponent's color
	if (board.spaces[move.x][move.y + 1] === targetToken) {
		// Check each space until the bottom of the board for one of my pieces
		for (var space = move.y + 2; space < board.rows; space++) {
			// If my piece is found return true; there's at least 1 legal move
			if (board.spaces[move.x][space] === myToken) {
				return true;
			}
		}
	}

	// Search Left
	// Check that searchable space is in bounds
	if (move.x - 2 >= 0) {
		// If space on left has a piece of the opponent's color
		if (board.spaces[move.x - 1][move.y] === targetToken) {
			// Check each space until the left of the board for one of my pieces
			for (var space = move.x - 2; space >= 0; space--) {
				// If my piece is found return true; there's at least 1 legal move
				if (board.spaces[space][move.y] === myToken) {
					return true;
				}
			}
		}
	}

	// Search Right
	// Check that the searchable space is in bounds
	if (move.x + 2 < board.rows) {
		// If space to the right has a piece of the opponent's color
		if (board.spaces[move.x + 1][move.y] === targetToken) {
			// Check each space until the right of the board for one of my pieces
			for (var space = move.x + 2; space < board.cols; space++) {
				// If my piece is found return true; there's at least 1 legal move
				if (board.spaces[space][move.y] === myToken) {
					return true;
				}
			}
		}
	}

	// Search Negative Diagonal
	// Check that the searchable space is in bounds
	if (move.x - 2 >= 0 && move.y - 2 >= 0) {
		// If space up and left has a piece of the opponent's color
		if (board.spaces[move.x - 1][move.y - 1] === targetToken) {
			// Check for my piece until the top left space of the board
			var delta = 2;
			while (move.x - delta >= 0 && move.y - delta >= 0) {
				// If my piece is found return true; there's at least 1 legal move
				if (board.spaces[move.x - delta][move.y - delta] === myToken) {
					return true;
				}
				delta++;
			}
		}
	}

	// Search Positive Diagonal
	// Check that the searchable space is in bounds
	if (move.x + 2 < board.cols && move.y + 2 < board.rows) {
		// If space down and right has a piece of the opponent's color
		if (board.spaces[move.x + 1][move.y + 1] === targetToken) {
			// Check for my piece until the bottom right space of the board
			var delta = 2;
			while (move.x + delta < board.cols && move.y + delta < board.rows) {
				// If my piece is found return true; there's at least 1 legal move
				if (board.spaces[move.x + delta][move.y + delta] === myToken) {
					return true;
				}
				delta++;
			}
		}
	}

	// Search Negative Sub-Diagonal
	// Check that the searchable space is in bounds
	if (move.x - 2 >= 0 && move.y + 2 < board.rows) {
		// If space down and left has a piece of the opponent's color
		if (board.spaces[move.x - 1][move.y + 1] === targetToken) {
			// Check for my piece until the bottom left space of the board
			var delta = 2;
			while (move.x - delta >= 0 && move.y + delta < board.rows) {
				// If my piece is found return true; there's at least 1 legal move
				if (board.spaces[move.x - delta][move.y + delta] === myToken) {
					return true;
				}
				delta++;
			}
		}
	}

	// Search Positive Sub-Diagonal
	// Check that the searchable space is in bounds
	if (move.x + 2 < board.cols && move.y - 2 >= 0) {
		// If space up and right has a piece of the opponent's color
		if (board.spaces[move.x + 1][move.y - 1] === targetToken) {
			// Check for my piece until the top right space of the board
			var delta = 2;
			while (move.x + delta < board.cols && move.y - delta >= 0) {
				// If my piece is found return true; there's at least 1 legal move
				if (board.spaces[move.x + delta][move.y + delta] === myToken) {
					return true;
				}
				delta++;
			}
		}
	}

	// If no legal move was found, return false
	return false;
};

// Draw players pieces on the canvas
Player.prototype.render = function() {
	for (var row = 0; row < board.rows; row++) {
		for (var col = 0; col < board.cols; col++) {
			if (board.spaces[row][col] === this.color) {
				ctx.drawImage(
                    Resources.get(this.sprite.img),
                    this.sprite.x, this.sprite.y,
                    space.width, space.height,
                    row * space.width + space.height, col * space.height + space.width,
                    space.width, space.height);
			}
		}
	}
};

/**
 * Instantiate Players
 */
var player1, player2;

// Create a fresh game state, called by the engine
// at the beginning of every new game
function initGame() {
    // Display opening message
    //messages.print('SHALL WE PLAY A GAME?', 36, 2);
    // Set game state to not over
    isGameOver = false;
    // Is ready is reset
    isReady = false;
    // Initialiaze board
    initBoard();
    // Instantiate players
    player1 = new Player('Danny', 'black');
	player2 = new Player('Lauren', 'white');
	// Set turn to 0
	turn = 'black';
    // Make the scoreboard
    //score = new Scoreboard();
}