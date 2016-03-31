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
var CANVAS_HEIGHT = 520;

// Define gameboard for canvas
var NUM_ROWS = 10;
var NUM_COLS = 10;
var space = {
	'height' : 32,
	'width' : 32
};

// Hold turn (by player piece color)
var turn;

// Holds move request coordinates and current mouse coordinates
var moveRequest = {};
var mouseLoc = {};

// Allows visable pieces previewing move
var allowGhosts = true;

// Waits for mouse clicks and sends the info moveRequest variable
document.addEventListener("mouseup", function (event) {
	moveRequest = mouseLoc;
}, false);

// Watches mouse movements for ghost overlays
document.addEventListener("mousemove", function (event) {
	var x = event.x;
	var y = event.y;

	var canvas = this.getElementById("myCanvas");

	x -= (canvas.offsetLeft + space.width);
	y -= (canvas.offsetTop + space.height);

	// Translate move into whole space numbers on the board
	mouseLoc = {
		'x' : Math.floor(x / space.width),
		'y' : Math.floor(y / space.height)
	};
}, false);

// Tabulate score by simply adding all the pieces of each color on the board
function addScore() {
	player1.score = 0;
	player2.score = 0;
	for (var i = 0; i < board.rows; i++) {
		for (var j = 0; j < board.cols; j++) {
			if (board.spaces[i][j] === player1.color) {
				player1.score++;
			}
			else if (board.spaces[i][j] === player2.color) {
				player2.score++;
			}
		}
	}
}

// Copies 2D array
function copyArray(sourceArr, targetArr) {
	for (var i = 0; i < sourceArr.length; i++) {
		for (var j = 0; j < sourceArr[i].length; j++) {
			targetArr[i][j] = sourceArr[i][j];
		}
	}
}

/**
 * Gameboard Class, which will create a 2D matrix to hold gameboard
 * @constructor
 * @param {boolean} isAGhost - True if board will be an alpha layer
 */
var Board = function(isAGhost) {
	this.rows = 8;
	this.cols = 8;
	this.spaces = new Array(this.rows);
	this.isAGhost = isAGhost;
    this.hasLegalMoves = true;
};

// Inititalize board matrix
Board.prototype.initBoard = function() {
	// Inititalize matrix size
	for (var row = 0; row < this.rows; row++) {
		this.spaces[row] = new Array(this.cols);
	}

	// Set middle four pieces to starting positions
	this.spaces[3][3] = 'white';
	this.spaces[4][4] = 'white';
	this.spaces[3][4] = 'black';
	this.spaces[4][3] = 'black';
};

// Check the board for existence of legal move. Returns true if found.
Board.prototype.legalMoveAvailable = function() {
    // Cycle through spaces of board and check for legality
    // Only look wt the main playing board
    if (!this.isAGhost) {
        for (var i = 0; i < this.cols; i++) {
            for (var j = 0; j < this.rows; j++) {
                // Make sure space isn't already occupied
                if (this.spaces[i][j] === undefined) {
                    // Check all directions from that space for a valid move
                    this.takeTurn({x : i, y : j});
                    // If valid move is found, return true
                    if (this.hasLegalMoves) {
                        return true;
                    }
                }
            }
        }
    }

    // If no valid moves were found, return false
    return false;
};

// Update player's pieces within the board, when detected
Board.prototype.update = function(dt) {
	// For the ghost overlay matrix, input is handled on mousemove
	if (this.isAGhost) {
		// First, reset the matrix to copy the actual gameboard
		copyArray(board.spaces, this.spaces);
		// Then check the mouse location and give an overlay for that move
		this.handleInput(mouseLoc);
	}

	// The main board will handle input only when the user clicks
	else {
		this.handleInput(moveRequest);
	}
};

// Account for user input on the board
Board.prototype.handleInput = function(move) {
	// Check if move is in bounds and not already taken
	if (move.x < this.cols &&
		move.x >= 0 &&
		move.y < this.rows &&
		move.y >= 0 &&
		this.spaces[move.x][move.y] === undefined) {

		// Attempt to take turn from user input.
		// If takeTurn(move) determines the current move is valid,
		//  turnTaken will evaluate to true
		var turnTaken = this.takeTurn(move);

		// If turn was taken, reset moveRequest and advance turn
		// Note: turn only advances if the main board reports a turn
		if (turnTaken && !this.isAGhost) {
			moveRequest = {};
			turn = (turn === 'white') ? 'black' : 'white';

			// Update player score
			addScore();

			// Check if any legal moves remain
			if (!this.legalMoveAvailable()) {
				console.log('Nothing left to play!');
			}
		}
	}
};

// If given move request was successful, this method will flip game pieces
//  and return true. Otherwise it returns false
Board.prototype.takeTurn = function(move) {
	// Establish which color piece to look for a match for
	var turnToken = turn;
	var targetToken = (turn === 'black') ? 'white' : 'black';

	// Track if valid move has been made, and thus, the turn taken
	var turnTaken = false;

	// Track if legal move was found during this pass
	this.hasLegalMoves = false;

	// TODO: Refactor this mess below. Could be more DRY

	// Search Up
	// If space above has a piece of the opponent's color
	if (this.spaces[move.x][move.y - 1] === targetToken) {
		// Look up each space until the top of the board for one of my pieces
		for (var space = move.y - 2; space >= 0; space--) {
			// If my piece is found, begin flipping previous pieces
			if (this.spaces[move.x][space] === turnToken) {
				this.hasLegalMoves = true;
				if (move === moveRequest || move === mouseLoc) {
					//console.log("On " + turn + "'s turn, found legal spaces above");
					while (++space <= move.y) {
						//console.log("flipping " + move.x + ", " + space + " from " + this.spaces[move.x][space] + " to " + turnToken);
						this.spaces[move.x][space] = turnToken;
					}
					// Set turn taken to true, and end for loop
					turnTaken = true;
					if (turnTaken) { break; }
				}
			}
			// TODO: move else if conditional into the for loop conditional
			// If an empty space is found, direction is invalid; end search
			else if (this.spaces[move.x][space] === undefined) {
				break;
			}
		}
	}

	// Search Down
	// If space below has a piece of the opponent's color
	if (this.spaces[move.x][move.y + 1] === targetToken) {
		// Check each space until the bottom of the board for one of my pieces
		for (var space = move.y + 2; space < board.rows; space++) {
			// If my piece is found, begin flipping previous pieces
			if (this.spaces[move.x][space] === turnToken) {
				this.hasLegalMoves = true;
				if (move === moveRequest || move === mouseLoc) {
					//console.log("On " + turn + "'s turn, found legal spaces below");
					while (space >= move.y) {
						//console.log("flipping " + move.x + ", " + space + " from " + this.spaces[move.x][space] + " to " + turnToken);
						this.spaces[move.x][space] = turnToken;
						space--;
					}
					// Set turn taken to true, and end for loop
					turnTaken = true;
					if (turnTaken) { break; }
				}
				// TODO: move else if conditional into the for loop conditional
				// If an empty space is found, direction is invalid; end search
				else if (this.spaces[move.x][space] === undefined) {
					break;
				}
			}
		}
	}

	// Search Left
	// Check that searchable space is in bounds
	if (move.x - 2 >= 0) {
		// If space on left has a piece of the opponent's color
		if (this.spaces[move.x - 1][move.y] === targetToken) {
			// Check each space until the left of the board for one of my pieces
			for (var space = move.x - 2; space >= 0; space--) {
				// If my piece is found, begin flipping previous pieces
				if (this.spaces[space][move.y] === turnToken) {
					this.hasLegalMoves = true;
					if (move === moveRequest || move === mouseLoc) {
						//console.log("On " + turn + "'s turn, found legal spaces to the left");
						while (space <= move.x) {
							//console.log("flipping " + space + ", " + move.y + " from " + this.spaces[space][move.y] + " to " + turnToken);
							this.spaces[space][move.y] = turnToken;
							space++;
						}
						// Set turn taken to true, and end for loop
						turnTaken = true;
						if (turnTaken) { break; }
					}
				}
				// TODO: move else if conditional into the for loop conditional
				// If an empty space is found, direction is invalid; end search
				else if (this.spaces[space][move.y] === undefined) {
					break;
				}
			}
		}
	}

	// Search Right
	// Check that the searchable space is in bounds
	if (move.x + 2 < board.rows) {
		// If space to the right has a piece of the opponent's color
		if (this.spaces[move.x + 1][move.y] === targetToken) {
			// Check each space until the right of the board for one of my pieces
			for (var space = move.x + 2; space < board.cols; space++) {
				// If my piece is found, begin flipping previous pieces
				if (this.spaces[space][move.y] === turnToken) {
					this.hasLegalMoves = true;
					if (move === moveRequest || move === mouseLoc) {
						//console.log("On " + turn + "'s turn, found legal spaces to the right");
						while (space >= move.x) {
							//console.log("flipping " + space + ", " + move.y + " from " + this.spaces[space][move.y] + " to " + turnToken);
							this.spaces[space][move.y] = turnToken;
							space--;
						}
						// Set turn taken to true, and end for loop
						turnTaken = true;
						if (turnTaken) { break; }
					}
				}
				// TODO: move else if conditional into the for loop conditional
				// If an empty space is found, direction is invalid; end search
				else if (this.spaces[space][move.y] === undefined) {
					break;
				}
			}
		}
	}

	// Search Negative Diagonal
	// Check that the searchable space is in bounds
	if (move.x - 2 >= 0 && move.y - 2 >= 0) {
		// If space up and left has a piece of the opponent's color
		if (this.spaces[move.x - 1][move.y - 1] === targetToken) {
			// Check for my piece until the top left space of the board
			for (var delta = 2;
				move.x - delta >= 0 && move.y - delta >= 0;
				delta++) {
				// If my piece is found, begin flipping previous pieces
				if (this.spaces[move.x - delta][move.y - delta] === turnToken) {
					this.hasLegalMoves = true;
					if (move === moveRequest || move === mouseLoc) {
						//console.log("On " + turn + "'s turn, found legal spaces up-left");
						while (--delta >= 0) {
							//console.log("flipping " + (move.x - delta) + ", " + (move.y - delta) + " from " + this.spaces[move.x - delta][move.y - delta] + " to " + turnToken);
							this.spaces[move.x - delta][move.y - delta] = turnToken;
						}
						// Set turn taken to true, and end for loop
						turnTaken = true;
						if (turnTaken) { break; }
					}
					// TODO: move else if conditional into the above loop conditional
					// If an empty space is found, direction is invalid; end search
					else if (this.spaces[move.x - delta][move.y - delta] === undefined) {
						break;
					}
				}
			} // End for loop
		}
	}

	// Search Positive Diagonal
	// Check that the searchable space is in bounds
	if (move.x + 2 < board.cols && move.y + 2 < board.rows) {
		// If space down and right has a piece of the opponent's color
		if (this.spaces[move.x + 1][move.y + 1] === targetToken) {
			// Check for my piece until the bottom right space of the board
			var delta = 2;
			while (move.x + delta < board.cols && move.y + delta < board.rows) {
				// If my piece is found, begin flipping previous pieces
				if (this.spaces[move.x + delta][move.y + delta] === turnToken) {
					this.hasLegalMoves = true;
					if (move === moveRequest || move === mouseLoc) {
						//console.log("On " + turn + "'s turn, found legal spaces down-right");
						while (delta >= 0) {
							//console.log("flipping " + (move.x + delta) + ", " + (move.y + delta) + " from " + this.spaces[move.x + delta][move.y + delta] + " to " + turnToken);
							this.spaces[move.x + delta][move.y + delta] = turnToken;
							delta--;
						}
						// Set turn taken to true, and end while loop
						turnTaken = true;
						if (turnTaken) { break; }
					}
					// TODO: move else if conditional into the above loop conditional
					// If an empty space is found, direction is invalid; end search
					else if (this.spaces[move.x + delta][move.y + delta] === undefined) {
						break;
					}
				} // Close move found if loop
                delta++;
			} // Close While loop
		}
	}

	// Search Negative Sub-Diagonal
	// Check that the searchable space is in bounds
	if (move.x - 2 >= 0 && move.y + 2 < board.rows) {
		// If space down and left has a piece of the opponent's color
		if (this.spaces[move.x - 1][move.y + 1] === targetToken) {
			// Check for my piece until the bottom left space of the board
			var delta = 2;
			while (move.x - delta >= 0 && move.y + delta < board.rows) {
				// If my piece is found, begin flipping previous pieces
				if (this.spaces[move.x - delta][move.y + delta] === turnToken) {
                    this.hasLegalMoves = true;
                    if (move === moveRequest || move === mouseLoc) {
					   //console.log("On " + turn + "'s turn, found legal spaces down-left");
					   while (delta >= 0) {
                           //console.log("flipping " + (move.x - delta) + ", " + (move.y + delta) + " from " + this.spaces[move.x - delta][move.y + delta] + " to " + turnToken);
                           this.spaces[move.x - delta][move.y + delta] = turnToken;
                           delta--;
					   }
					   // Set turn taken to true, and end while loop
					   turnTaken = true;
					   if (turnTaken) { break; }
				    }
				    // TODO: move else if conditional into the above loop conditional
				    // If an empty space is found, direction is invalid; end search
				    else if (this.spaces[move.x - delta][move.y + delta] === undefined) {
					   break;
				    }
                }
				delta++;
			}
		}
	}

	// Search Positive Sub-Diagonal
	// Check that the searchable space is in bounds
	if (move.x + 2 < board.cols && move.y - 2 >= 0) {
		// If space up and right has a piece of the opponent's color
		if (this.spaces[move.x + 1][move.y - 1] === targetToken) {
			// Check for my piece until the top right space of the board
			var delta = 2;
			while (move.x + delta < board.cols && move.y - delta >= 0) {
				// If my piece is found, begin flipping previous pieces
				if (this.spaces[move.x + delta][move.y - delta] === turnToken) {
                    this.hasLegalMoves = true;
                    if (move === moveRequest || move === mouseLoc) {
					   //console.log("On " + turn + "'s turn, found legal spaces up-right");
					   while (delta >= 0) {
                           //console.log("flipping " + (move.x + delta) + ", " + (move.y - delta) + " from " + this.spaces[move.x + delta][move.y - delta] + " to " + turnToken);
                           this.spaces[move.x + delta][move.y - delta] = turnToken;
                           delta--;
					   }
					   // Set turn taken to true, and end while loop
					   turnTaken = true;
					   if (turnTaken) { break; }
				    }
				    // TODO: move else if conditional into the above loop conditional
				    // If an empty space is found, direction is invalid; end search
				    else if (this.spaces[move.x + delta][move.y - delta] === undefined) {
					   break;
				    }
                }
				delta++;
			}
		}
	}

	// If no legal move was found, this will return false
	return turnTaken;
};

// Draw players pieces on the canvas
Board.prototype.render = function() {
	this.drawPieces(player1);
	this.drawPieces(player2);
};

// Given a player, draw pieces on the gameboard, with transparency if needed
Board.prototype.drawPieces = function(player) {
	// If this is a ghost board, set sprites to be partially transparent
	if (this.isAGhost) {
		ctx.globalAlpha = .6;
	}
	// Otherwise, reset transparency
	else {
		ctx.globalAlpha = 1;
	}
	// Draw each piece of the matrix, given the player object
	for (var row = 0; row < this.rows; row++) {
		for (var col = 0; col < this.cols; col++) {
			if (this.spaces[row][col] === player.color) {
				ctx.drawImage(
					Resources.get(player.sprite.img),
					player.sprite.x, player.sprite.y,
					space.width, space.height,
					row * space.width + space.height, col * space.height + space.width,
					space.width, space.height);
			}
		}
	}
};

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
	this.score = 2;
};

// Update player's pieces
Player.prototype.update = function(dt) {

};

// Account for user input
Player.prototype.handleInput = function(move, board) {

};

/**
 * Scoreboad Class, which will display scores and other UI information
 * @constructor
 */
var Scoreboard = function() {

};

// Update scoreboard info
Scoreboard.prototype.update = function() {

};

// Render Scoreboard
Scoreboard.prototype.render = function() {
    // Clear area of any pixel remnants
    ctx.clearRect(0, 320, CANVAS_WIDTH, 200);

    ctx.font = 'bold 20px Courier';
    ctx.fillStyle = '#000'; // For black text

    // Display who's turn it is
    var messageString = "It's " + turn + "'s turn";
    ctx.fillText(messageString, 64, 372);

    // Render scores
	this.printScore(player1, 32, 325);
	this.printScore(player2, 200, 325);
};

/**
 * Prints the score of one player, along with their piece sprite
 * @param {object} player - The player who's score to print.
 * @param {integer} xPos - x coordinated for the score to appear on the canvas
 * @param {integer} yPos - y coordinated for the score to appear on the canvas
 */
Scoreboard.prototype.printScore = function(player, xPos, yPos) {
    // Draw Player Chip Image
    var sprite = Resources.get(player.sprite.img);
    ctx.drawImage(sprite,
		player.sprite.x, player.sprite.y,
		space.width, space.height,
		xPos, yPos,
		space.width, space.height);
    // Draw Player score
    var scoreString = 'x ' + player.score;
    ctx.fillText(scoreString, xPos + 40, (yPos + 25));
};

/**
 * Instantiate players and boards
 */
var player1, player2, board, ghostBoard;

// Create a fresh game state, called by the engine
// at the beginning of every new game
function initGame() {
    // Display opening message
    //messages.print('SHALL WE PLAY A GAME?', 36, 2);
    // Set game state to not over
    isGameOver = false;
    // Is ready is reset
    isReady = false;
    // Initialize main board matrix
    board = new Board(false);
    board.initBoard();
    // Initialize ghost board matrix
    ghostBoard = new Board(true);
    ghostBoard.initBoard();
    // Instantiate players
    player1 = new Player('Danny', 'black');
	player2 = new Player('Lauren', 'white');
	// Set turn to 0
	turn = 'black';
    // Make the scoreboard
    score = new Scoreboard();
}