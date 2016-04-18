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
var alert = {
	'string' : "Let's Play Reversi!",
	'yPos' : 405,
	'seconds' : 2
};

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
var mouseDown = false;

// Allows visable pieces previewing move
var allowGhosts = true;
// Size and placement of on/off toggle
var ghostOnX = space.width * 7;
var ghostOnY = space.height * 13;
var userClick = false;

// Object to hold history of all moves. Each element is a 2D array
var movesHistory = {};

function init2DArray(a) {
	for (var row = 0; row < 8; row++) {
		a[row] = new Array(8);
	}
	a[3][3] = 'white';
	a[4][4] = 'white';
	a[3][4] = 'black';
	a[4][3] = 'black';
}

// TODO: make the input event listeners more DRY
// Waits for mouse clicks and sends the info moveRequest variable
document.addEventListener("mouseup", function (event) {
	userClick = true;
	if (!arraysHaveEqualContents(ghostBoard.spaces, board.spaces)) {
		push2DArray(movesHistory, board.spaces);
	}
	moveRequest = mouseLoc;
	mouseDown = false;
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

// Returns true if mouse button is pressed
document.addEventListener("mousedown", function (event) {
	mouseDown = true;
}, false);

// Watches touch movements for ghost overlays
document.addEventListener("touchmove", function (event) {
	// Prevent page from scrolling when touch is detected
	if (event.target === document.getElementById("myCanvas")) {
		event.preventDefault();
	}
	var x = event.targetTouches[0].pageX;
	var y = event.targetTouches[0].pageY;

	var canvas = this.getElementById("myCanvas");

	x -= (canvas.offsetLeft + space.width);
	y -= (canvas.offsetTop + space.height);

	// Translate move into whole space numbers on the board
	mouseLoc = {
		'x' : Math.floor(x / space.width),
		'y' : Math.floor(y / space.height)
	};
}, false);

document.addEventListener("touchstart", function (event) {
	// Prevent page from scrolling when touch is detected
	if (event.target === document.getElementById("myCanvas")) {
		event.preventDefault();
	}
	var x = event.targetTouches[0].pageX;
	var y = event.targetTouches[0].pageY;

	var canvas = this.getElementById("myCanvas");

	x -= (canvas.offsetLeft + space.width);
	y -= (canvas.offsetTop + space.height);

	// Translate move into whole space numbers on the board
	mouseLoc = {
		'x' : Math.floor(x / space.width),
		'y' : Math.floor(y / space.height)
	};
}, false);

// Listen for user touch
document.addEventListener("touchend", function (event) {
	// Prevent page from scrolling when touch is detected
	if (event.target === document.getElementById("myCanvas")) {
		event.preventDefault();
	}
	userClick = true;
	if (!arraysHaveEqualContents(ghostBoard.spaces, board.spaces)) {
		push2DArray(movesHistory, board.spaces);
	}
	moveRequest = mouseLoc;
	mouseDown = false;
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

// Compares 2D array, returns true if they have equal contents
function arraysHaveEqualContents(a1, a2) {
	for (var i = 0; i < a1.length; i++) {
		for (var j = 0; j < a1[i].length; j++) {
			if (a1[i][j] != a2[i][j]) {
				return false;
			}
		}
	}
	return true;
}

// Prints 2D array to console, for debugging
function print2DArray(a) {
	for (var i = 0; i < a.length; i++) {
		var lineString = '';
		for (var j = 0; j < a[i].length; j++) {
			if (a[j][i] === 'black') {
				lineString += '|B';
			}
			else if (a[j][i] === 'white') {
				lineString += '|W';
			}
			else {
				lineString += '| ';
			}
			if (j === (a.length - 1)) { lineString += "|" }
		}
		console.log(lineString + '\n_________________');
	}
	console.log('*******************************')
}

// Append 2D array element to an Object
function push2DArray(obj, arr) {
	// Find current length of object
	var oLength = Object.keys(obj).length;

	// Initialize 2D array at the end of the object
	movesHistory[oLength] = [arr.length];
	init2DArray(movesHistory[oLength - 1]);

	// Copy given array into newly initialized array
	copyArray(arr, obj[oLength - 1]);
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
	// Check if user is clicking an option
	// Check if user requests ghost moves on
	if (move.x >= 6 &&
		move.x < 7 &&
		move.y >= 12 &&
		move.y < 13 && userClick) {
		allowGhosts = true;
	}

	// Check if user requests ghost moves off
	if (move.x >= 7 &&
		move.x < 8 &&
		move.y >= 12 &&
		move.y < 13 && userClick) {
		allowGhosts = false;
	}

	// Check if user wants to reset game
	if (move.x >= 0 &&
		move.x <= 1 &&
		move.y === 12 && userClick) {
		var reset = confirm('End current game and start a new one?');
		if (reset) {
			initGame();
		}
	}

	// Check if user wants to undo move
	if (move.x >= 3 &&
		move.x <= 4 &&
		move.y === 12 && userClick) {
		var undo = true; //confirm('Undo last move?');
		// Find length of moves history Object
		var oLength = Object.keys(movesHistory).length;
		// Make sure move isn't first move
		if (undo && oLength > 1) {
			// Copy previous move onto gameboard
			copyArray(movesHistory[oLength - 2], board.spaces);
			// Delete last move from the history
			delete movesHistory[oLength - 1];
			// Update history object length
			oLength = Object.keys(movesHistory).length;
			// Revert turn
			turn = (turn === 'white') ? 'black' : 'white';
			if (isGameOver) {
				isGameOver = false;
				alert = {};
			}
		}
	}

	userClick = false;

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
				// If not, see if turn can be skipped to the other player
				turn = (turn === 'white') ? 'black' : 'white';
				// If a legal move is found upon skipping turn, alert players
				if (this.legalMoveAvailable()) {
					alert = {
						'string' : 'Skipping ' +
							((turn === 'white') ? 'black' : 'white') +
							"'s turn!",
						'yPos' : 400,
						'seconds' : 3
					};
				}
				// If the skip provides no legal moves, the game is over
				else {
					turn = (turn === 'white') ? 'black' : 'white';
					var winner = (player1.score > player2.score) ?
						player1.color : player2.color;
					alert = {
						'string' : 'Game over, ' + winner + ' wins!',
						'yPos' : 400,
						'seconds' : 99
					};
					isGameOver = true;
				}
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
	this.secondsToFlash = 3;
	this.flashAlpha = 1.0;
	this.alphaMin = .25;
	this.isFlashingDown = true;
};

// Update scoreboard info
Scoreboard.prototype.update = function(dt) {
	// Check if there's a message to display
	if (alert.seconds > 0) {
		// Count down timer for visabilty
		alert.seconds -= (1 * dt);
		// Check if timer is up
		if (alert.seconds <= 0) {
			// Reset alert
			alert.seconds = 0;
		}
	}

	// Flashing text controller
	// Count flashAlpha down to 0
	if (this.isFlashingDown) {
		this.flashAlpha -= ((1 / this.secondsToFlash) * dt);
		if (this.flashAlpha <= this.alphaMin) {
			this.isFlashingDown = false;
		}
	}
	// Once flashAlpha is at 0, count back up to 0
	if (!this.isFlashingDown) {
		this.flashAlpha += ((1 / this.secondsToFlash) * dt);
		if (this.flashAlpha >= 1) {
			this.isFlashingDown = true;
		}
	}
};

// Render Scoreboard
Scoreboard.prototype.render = function() {
    // Clear area of any pixel remnants
    //ctx.clearRect(0, 320, CANVAS_WIDTH, 200);

    ctx.font = 'bold 20px Courier';
    ctx.fillStyle = '#000'; // For black text

    // Display who's turn it is
    var messageString = "It's " + turn + "'s turn";
	ctx.globalAlpha = this.flashAlpha;
    if (!isGameOver) {
		ctx.fillText(messageString, 64, 372);
	}
	ctx.globalAlpha = 1;

    // Render scores
	this.printScore(player1, 64, 320);
	this.printScore(player2, 192, 320);

	// Print messages, if any
	if (alert.seconds > 0) {
		this.printAlert(alert);
	}

	// Show ghost moves option
	this.showGhostToggle();

	// Print reset button
	this.printButton('Reset Game', 1);

	// Print undo button
	this.printButton('Undo', 4);
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
	ctx.font = 'bold 20px Courier';
    ctx.fillText(scoreString, xPos + 40, (yPos + 24));
};

/**
 * Prints Alert message (usually at bottom of scoreboard)
 * @param {object} message - Message to display. Message object must have
 * the following properties: 'string', 'yPos', and 'seconds'. 'string' is
 * the actual message string, 'yPos' is where, in pixels, to display the
 * message, and 'seconds' is how long the message is to be displayed.
 */
Scoreboard.prototype.printAlert = function(message) {
	ctx.font = 'bold 20px Courier';
	ctx.fillStyle = '#000'; // For black text
	// Find message length and use to center alert
	var x = CANVAS_WIDTH / 2 - (message.string.length * 11 / 2);
	ctx.fillText(message.string, x, message.yPos);
};

// Prints ghost moves toggle button
Scoreboard.prototype.showGhostToggle = function() {
	ctx.font = 'bold 12px Courier';
	ctx.fillStyle = '#000'; // For black text
	ctx.fillText('Ghost Moves', 216, ghostOnY + 38);

	// Display toggle sprite from sprite sheet
	var toggleSprite = Resources.get('images/switch.png');
	// Select position of appropriate sprite from sheet
	var onY = (allowGhosts) ? 0 : 70;
	ctx.drawImage(toggleSprite, 0, onY, 128, 64, ghostOnX, ghostOnY, 64, 32);
};

/**
 * Prints Button with a label describing what it does
 * @param {string} label - the text to display under button
 * @param {integer} xPosSpace - an integer corresponding to the space on the
 * board underwhich to left-align the button
 */
Scoreboard.prototype.printButton = function(label, xPosSpace) {
	// Display label
	ctx.font = 'bold 12px Courier';
	ctx.fillStyle = '#000'; // For black text
	// Center text under button by finding length of string
	var x = (space.width * xPosSpace + 32) - (label.length * 7.5 / 2);
	ctx.fillText(label, x, ghostOnY + 38);
	// Display button
	// Display image (up or down) based on if user click's on
	//  button's location on the board
	var buttonSprite = Resources.get((mouseDown && mouseLoc.y === 12 &&
									  (mouseLoc.x >= xPosSpace - 1 &&
									  mouseLoc.x <= xPosSpace)) ?
									 'images/buttonPress.png' :
									 'images/button.png');
	ctx.drawImage(buttonSprite, space.width * xPosSpace, ghostOnY, 64, 26);
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
	//Initialize Undo history object
	movesHistory = {};
	movesHistory[0] = [];
    // Instantiate players
    player1 = new Player('Danny', 'black');
	player2 = new Player('Lauren', 'white');
	// Set turn to 0
	turn = 'black';
    // Make the scoreboard
    score = new Scoreboard();
}