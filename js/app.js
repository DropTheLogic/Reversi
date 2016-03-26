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
	}
};

// Account for user input
Player.prototype.handleInput = function(move) {
	// Check if move is in bounds and not already taken
	if (move.x < board.cols &&
		move.x >= 0 &&
		move.y < board.rows &&
		move.y >= 0 &&
		board.spaces[move.x][move.y] === undefined) {

		// Attempt to take turn from user input.
		// If takeTurn(move) determines the current move is valid,
		//  turnTaken will evaluate to true
		var turnTaken = this.takeTurn(move);

		// If turn was taken, reset moveRequest and advance turn
		if (turnTaken) {
			moveRequest = {};
			turn = (turn === 'white') ? 'black' : 'white';
			console.log("************************");
			console.log("Now it's " + turn + "'s turn!");
		}
	}
};

// If given move request was successful, this method will flip game pieces
//  and return true. Otherwise it returns false
Player.prototype.takeTurn = function(move) {
	// Establish which color piece to look for a match for
	var myToken = turn;
	var targetToken = (turn === 'black') ? 'white' : 'black';

	// Track if valid move has been made, and thus, the turn taken
	var turnTaken = false;

	// TODO: Refactor this mess below. Could be more DRY

	// Search Up
	// If space above has a piece of the opponent's color
	if (board.spaces[move.x][move.y - 1] === targetToken) {
		// Look up each space until the top of the board for one of my pieces
		for (var space = move.y - 2; space >= 0; space--) {
			// If my piece is found, begin flipping previous pieces
			if (board.spaces[move.x][space] === myToken) {
				//console.log("On " + turn + "'s turn, found legal spaces above");
				while (++space <= move.y) {
					//console.log("flipping " + move.x + ", " + space + " from " + board.spaces[move.x][space] + " to " + myToken);
					board.spaces[move.x][space] = this.color;
				}
				// Set turn taken to true, and end for loop
				turnTaken = true;
				break;
			}
			// TODO: move else if conditional into the for loop conditional
			// If an empty space is found, direction is invalid; end search
			else if (board.spaces[move.x][space] === undefined) {
				break;
			}
		}
	}

	// Search Down
	// If space below has a piece of the opponent's color
	if (board.spaces[move.x][move.y + 1] === targetToken) {
		// Check each space until the bottom of the board for one of my pieces
		for (var space = move.y + 2; space < board.rows; space++) {
			// If my piece is found, begin flipping previous pieces
			if (board.spaces[move.x][space] === myToken) {
				//console.log("On " + turn + "'s turn, found legal spaces below");
				while (space >= move.y) {
					//console.log("flipping " + move.x + ", " + space + " from " + board.spaces[move.x][space] + " to " + myToken);
					board.spaces[move.x][space] = this.color;
					space--;
				}
				// Set turn taken to true, and end for loop
				turnTaken = true;
				if (turnTaken) { break; }
			}
			// TODO: move else if conditional into the for loop conditional
			// If an empty space is found, direction is invalid; end search
			else if (board.spaces[move.x][space] === undefined) {
				break;
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
				// If my piece is found, begin flipping previous pieces
				if (board.spaces[space][move.y] === myToken) {
					//console.log("On " + turn + "'s turn, found legal spaces to the left");
					while (space <= move.x) {
						//console.log("flipping " + space + ", " + move.y + " from " + board.spaces[space][move.y] + " to " + myToken);
						board.spaces[space][move.y] = this.color;
						space++;
					}
					// Set turn taken to true, and end for loop
					turnTaken = true;
					if (turnTaken) { break; }
				}
				// TODO: move else if conditional into the for loop conditional
				// If an empty space is found, direction is invalid; end search
				else if (board.spaces[space][move.y] === undefined) {
					break;
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
				// If my piece is found, begin flipping previous pieces
				if (board.spaces[space][move.y] === myToken) {
					//console.log("On " + turn + "'s turn, found legal spaces to the right");
					while (space >= move.x) {
						//console.log("flipping " + space + ", " + move.y + " from " + board.spaces[space][move.y] + " to " + myToken);
						board.spaces[space][move.y] = this.color;
						space--;
					}
					// Set turn taken to true, and end for loop
					turnTaken = true;
					if (turnTaken) { break; }
				}
				// TODO: move else if conditional into the for loop conditional
				// If an empty space is found, direction is invalid; end search
				else if (board.spaces[space][move.y] === undefined) {
					break;
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
			for (var delta = 2;
				move.x - delta >= 0 && move.y - delta >= 0;
				delta++) {
				// If my piece is found, begin flipping previous pieces
				if (board.spaces[move.x - delta][move.y - delta] === myToken) {
					//console.log("On " + turn + "'s turn, found legal spaces up-left");
					while (--delta >= 0) {
						//console.log("flipping " + (move.x - delta) + ", " + (move.y - delta) + " from " + board.spaces[move.x - delta][move.y - delta] + " to " + myToken);
						board.spaces[move.x - delta][move.y - delta] = this.color;
					}
					// Set turn taken to true, and end for loop
					turnTaken = true;
					if (turnTaken) { break; }
				}
				// TODO: move else if conditional into the above loop conditional
				// If an empty space is found, direction is invalid; end search
				else if (board.spaces[move.x - delta][move.y - delta] === undefined) {
					break;
				}
			} // End for loop
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
				// If my piece is found, begin flipping previous pieces
				if (board.spaces[move.x + delta][move.y + delta] === myToken) {
					//console.log("On " + turn + "'s turn, found legal spaces down-right");
					while (delta >= 0) {
						//console.log("flipping " + (move.x + delta) + ", " + (move.y + delta) + " from " + board.spaces[move.x + delta][move.y + delta] + " to " + myToken);
						board.spaces[move.x + delta][move.y + delta] = this.color;
						delta--;
					}
					// Set turn taken to true, and end while loop
					turnTaken = true;
					if (turnTaken) { break; }
				}
				// TODO: move else if conditional into the above loop conditional
				// If an empty space is found, direction is invalid; end search
				else if (board.spaces[move.x + delta][move.y + delta] === undefined) {
					break;
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
				// If my piece is found, begin flipping previous pieces
				if (board.spaces[move.x - delta][move.y + delta] === myToken) {
					//console.log("On " + turn + "'s turn, found legal spaces down-left");
					while (delta >= 0) {
						//console.log("flipping " + (move.x - delta) + ", " + (move.y + delta) + " from " + board.spaces[move.x - delta][move.y + delta] + " to " + myToken);
						board.spaces[move.x - delta][move.y + delta] = this.color;
						delta--;
					}
					// Set turn taken to true, and end while loop
					turnTaken = true;
					if (turnTaken) { break; }
				}
				// TODO: move else if conditional into the above loop conditional
				// If an empty space is found, direction is invalid; end search
				else if (board.spaces[move.x - delta][move.y + delta] === undefined) {
					break;
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
				// If my piece is found, begin flipping previous pieces
				if (board.spaces[move.x + delta][move.y - delta] === myToken) {
					//console.log("On " + turn + "'s turn, found legal spaces up-right");
					while (delta >= 0) {
						//console.log("flipping " + (move.x + delta) + ", " + (move.y - delta) + " from " + board.spaces[move.x + delta][move.y - delta] + " to " + myToken);
						board.spaces[move.x + delta][move.y - delta] = this.color;
						delta--;
					}
					// Set turn taken to true, and end while loop
					turnTaken = true;
					if (turnTaken) { break; }
				}
				// TODO: move else if conditional into the above loop conditional
				// If an empty space is found, direction is invalid; end search
				else if (board.spaces[move.x + delta][move.y - delta] === undefined) {
					break;
				}
				delta++;
			}
		}
	}

	// If no legal move was found, this will return false
	return turnTaken;
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