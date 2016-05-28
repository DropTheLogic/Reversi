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
var resetRequest = false;
var waitTime = 2;
var wait = 0;

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
	mouseDown = true;
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
	if (!isGameOver) {
		mouseLoc = {
			'x' : Math.floor(x / space.width),
			'y' : Math.floor(y / space.height)
		};
	}
	mouseDown = true;
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

// Return random number between two given integers (inclusive)
function getRand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
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

// Returns array of legal moves for current turn, { x : INT, y : INT } format
Board.prototype.findLegalSpaces = function() {
	// Array holding legal moves for the current player
	var legalSpaces = [];

	// Scan board for empty spaces
	if (!this.isAGhost) {
		for (var i = 0; i < this.cols; i++) {
			for (var j = 0; j < this.rows; j++) {
				var eMove = { x : i, y : j };
				// If space is empty
				if (this.spaces[i][j] === undefined) {
					this.takeTurn(eMove);
					// If space would yield a legal move
					if (this.hasLegalMoves) {
						// Add space to empty space array
						legalSpaces.push(eMove);
					}
				}
            }
        }
    }

    return legalSpaces;
};

/**
 * Returns a move object {x : INT, y : INT} after considering the values of
 * the available moves.
 * @param {integer} moves - the number of moves to look ahead
 */
Board.prototype.getAiMove = function(moves) {
	var myTurn = (turn === player1.color) ? player1.color : player2.color;
	var highestValue = 0;
	var highestIndex = 0;

	// Create array of available legal moves
	var legalSpaces = this.findLegalSpaces();

	// Calculate the amount of positive value added by each move.
	// One flipped piece = 1
	// An edge piece = 4
	// A corner piece = 8 (implicitely found)
	if (moves > 0) {
		console.log("**************** " + turn + "'s turn ****************");
	}
	for (var index = 0; index < legalSpaces.length; index++) {
		// Track the value added if this space is played
		var value = 0;
		// Track the amount of own pieces currently on the board
		//var currentScore =
		//	(turn === player1.color) ? player1.score : player2.score;
		// Create backup of current board
		var currentState = [8];
		init2DArray(currentState);
		copyArray(this.spaces, currentState);

		// Create move request from list of legal moves
		moveRequest = legalSpaces[index];

		// Take the turn
		this.takeTurn(moveRequest);

		// Take virtual turns according to how many moves ahead to look
		// How far to allow recursive vision
		var movesToLookAhead = moves;
		if (movesToLookAhead > 0) {
			//console.log("On " + turn + "'s turn, proposed move is (" +
			//	legalSpaces[index].x + ", " + legalSpaces[index].y + ")");

			// Advance turn to other player
			turn = (turn === 'white') ? 'black' : 'white';

			// Check that opponent has a turn
			if (this.legalMoveAvailable()) {
				// Find ai move for opponent
				moveRequest = this.getAiMove(--movesToLookAhead);
				// Take opponents turn
				this.takeTurn(moveRequest);
			}

			// Revert turn
			turn = (turn === 'white') ? 'black' : 'white';
		}

		// Cycle through spaces on the board and tally values
		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				// If my piece is found on the board, calculate it's value
				if (this.spaces[i][j] === myTurn) {
					// If piece lies on a corner
					if ((i === 0 && j === 0) || (i === 0 && j === 7) ||
						(i === 7 && j === 0) || (i === 7 && j === 7)) {
						value += 40;
					}
					// If piece lies on the upper or bottom border
					if (i === 0 || i === 7) {
						value += 2;
					}
					// If piece lies on the left or right border
					if (j === 0 || j === 7) {
						value += 2;
					}
					// If piece is anywhere else
					else {
						value++;
					}
				}
			}
		}

		//console.log("value for " + turn + ": " + value);

		// Subtract current number of pieces from value to show value added
		//value -= currentScore;

		// Compare new value to highest value, update highest value if needed
		if (value > highestValue) {
			highestValue = value;
			highestIndex = index;
		}

		// Revert board back to original state
		copyArray(currentState, this.spaces);
	}
	console.log("Best move for " + turn + " is (" +
		legalSpaces[highestIndex].x + ", " +
		legalSpaces[highestIndex].y + "), with a value of " + highestValue);

	// Return move with the highest value
	return legalSpaces[highestIndex];
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

	// If one or more players are bots, take turns automatically
	else if (isReady && !isGameOver &&
		!overlay.isVisible && wait > waitTime &&
		(player1.isABot && (turn === player1.color) ||
		player2.isABot && (turn === player2.color))) {
		// Get move, from ai calculation
		moveRequest = this.getAiMove(2);

		// Send move to be handled
		this.handleInput(moveRequest);

		// Add to move to undo list, if applicable
		if (!arraysHaveEqualContents(ghostBoard.spaces, board.spaces)) {
			push2DArray(movesHistory, board.spaces);
		}
	}

	// The main board will handle input only when the user clicks and isn't
	// a bot's turn
	else if ((!player1.isABot && turn === player1.color) ||
		(!player2.isABot && turn === player2.color)){
		this.handleInput(moveRequest);
	}

	// Update wait timer
	wait += (1 * dt);
};

// Account for user input on the board
Board.prototype.handleInput = function(move) {
	// Check if user is clicking an option
	// Check if user requests ghost moves on
	if (move.x >= 6 &&
		move.x < 7 &&
		move.y >= 12 &&
		move.y < 13 && userClick && !isGameOver) {
		allowGhosts = true;
	}

	// Check if user requests ghost moves off
	if (move.x >= 7 &&
		move.x < 8 &&
		move.y >= 12 &&
		move.y < 13 && userClick && !isGameOver) {
		allowGhosts = false;
	}

	// Check if user wants to reset game
	if (move.x >= 0 &&
		move.x <= 1 &&
		move.y === 12 && userClick && (!overlay.isVisible || isGameOver)) {
		// Reset mouseLoc to prevent infinte loop
		mouseLoc = {};
		resetRequest = confirm('End current game and start a new one?');
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
			}
		}
	}

	// Check if move is in bounds and not already taken
	if (move.x < this.cols &&
		move.x >= 0 &&
		move.y < this.rows &&
		move.y >= 0 &&
		this.spaces[move.x][move.y] === undefined && !isGameOver) {

		// Attempt to take turn from user input.
		// If takeTurn(move) determines the current move is valid,
		//  turnTaken will evaluate to true
		var turnTaken = this.takeTurn(move);

		// If turn was taken, reset moveRequest and advance turn
		// Note: turn only advances if the main board reports a turn
		if (turnTaken && !this.isAGhost) {
			// Reset wait timer for autoPlay
			wait = 0;
			moveRequest = {};
			score.initTurnAnimation();
			turn = (turn === 'white') ? 'black' : 'white';

			// Update player score
			addScore();

			// Check if any legal moves remain
			if (!this.legalMoveAvailable()) {
				// If not, see if turn can be skipped to the other player
				turn = (turn === 'white') ? 'black' : 'white';
				// If a legal move is found upon skipping turn, alert players
				if (this.legalMoveAvailable()) {
					var mess = 'Skipping ' +
							((turn === 'white') ? 'black' : 'white') +
							"'s turn!";
					overlay.popup(mess);
				}
				// If the skip provides no legal moves, the game is over
				else {
					turn = (turn === 'white') ? 'black' : 'white';
					var winner = '';
					var mess = '';
					// In case of tie
					if (player1.score === player2.score) {
						mess = 'Game over, tie game!!';
					}
					else {
						winner = (player1.score > player2.score) ?
						player1.color : player2.color;
						mess = 'Game over, ' + winner + ' wins!';
					}
					overlay.popup(mess);
					isGameOver = true;
					isReady = false;
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

	// Object defines direction of delta variables
	var directions = {
		'up' : { 'x' : 0, 'y' : -1 },
		'down' : { 'x' : 0, 'y' : 1 },
		'left' : { 'x' : -1, 'y' : 0 },
		'right' : { 'x' : 1, 'y' : 0 },
		'upLeft' : { 'x' : -1, 'y' : -1 },
		'upRight' : { 'x' : 1, 'y' : -1},
		'downLeft' : { 'x' : -1, 'y' : 1},
		'downRight' : { 'x' : 1, 'y' : 1 }
	};

	// Search each direction
	for (var key in directions) {
		var dir = directions[key];
		// Check that the space is in bounds, positive and negative
		if (move.x + dir.x * 2 < board.spaces.length &&
			move.x + dir.x * 2 >= 0 &&
			move.y + dir.y * 2 < board.spaces.length &&
			move.y + dir.y * 2 >= 0) {
			// Define delta variables
			var dx = move.x;
			var dy = move.y;
			// If next space has a piece of the opponent's color
			if (this.spaces[dx + dir.x][dy + dir.y] === targetToken) {
				// Set delta values to two spaces away from proposed move
				dx += dir.x * 2;
				dy += dir.y * 2;
				// Search for my piece until the end of the board
				while (dx < board.spaces.length && dx >= 0 &&
					   dy < board.spaces.length && dy >= 0) {
					// If my piece is found, begin flipping previous pieces
					if (this.spaces[dx][dy] === turnToken) {
						this.hasLegalMoves = true;
						if (move === moveRequest || move === mouseLoc) {
							// Decrement the delta values back to the origin
							while (dx != move.x || dy != move.y) {
								dx -= dir.x;
								dy -= dir.y;
								this.spaces[dx][dy] = turnToken;
							}
							// Set turn taken to true, and end loop
							turnTaken = true;
							if (turnTaken) { break; }
						}
					}
					// If an empty space is found, direction is invalid;
					//  end search
					else if (this.spaces[dx][dy] === undefined) {
						break;
					}
					// Increment deltas
					dx += dir.x;
					dy += dir.y;
				} // End while loop
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
	this.isABot = false;
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
	this.messageString = 'Black begins!';
	this.firstTime = true;
	this.secondsToFlash = 3;
	this.flashAlpha = 1.0;
	this.alphaMin = 0.1;
	this.alphaMax = 0.7;
	this.isFlashingDown = true;
};

Scoreboard.prototype.initTurnAnimation = function() {
	this.delayToFlash = 2;
	this.flashAlpha = 0;
	this.firstTime = false;
};

// Update scoreboard info
Scoreboard.prototype.update = function(dt) {
	// Flashing text controller
	// When delay timer is up
	if (this.delayToFlash < 0) {
		// Count flashAlpha down to alphaMin
		if (this.isFlashingDown) {
			this.flashAlpha -= ((1 / this.secondsToFlash) * dt);
			if (this.flashAlpha <= this.alphaMin) {
				this.isFlashingDown = false;
			}
		}
		// Count back up to alphaMax
		if (!this.isFlashingDown) {
			this.flashAlpha += ((1 / this.secondsToFlash) * dt);
			if (this.flashAlpha >= this.alphaMax) {
				this.isFlashingDown = true;
			}
		}
	}
	// Countdown delay timer
	else {
		this.delayToFlash -= (1 * dt);
	}
};

// Render Scoreboard
Scoreboard.prototype.render = function() {

	ctx.font = 'bold 20px Courier';
	ctx.fillStyle = '#000';
	ctx.textAlign = 'center';

	// Display who's turn it is
	if (!isGameOver && isReady) {
		// Attach appropriate alpha level for message
		ctx.globalAlpha = this.flashAlpha;
		// Update turn name, if not at the beginning of the game
		if (!this.firstTime) {
			this.messageString = "It's " + turn + "'s turn";
		}
		// Print message
		ctx.fillText(this.messageString, CANVAS_WIDTH / 2, 372);
	}
	ctx.globalAlpha = 1;

	// Render scores
	ctx.textAlign = 'left';
	this.printScore(player1, 64, 320);
	this.printScore(player2, 192, 320);

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
	ctx.textAlign = 'left';
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
 * Overlay class, used to print entire pages or screens overtop of the
 * gamaeboard. Use to display messages or for end of game or start screens.
 * @constructor
 */
var Overlay = function() {
	this.buttons = [];
	this.shadowOffset = 2;
	this.start();
	this.isVisible = true;
};

// Update overlay variables
Overlay.prototype.update = function(dt) {
	// Update states
	if (isGameOver && !isReady) {
			// Create Play again buttons
			var playW = 128;
			this.createButton("Play Again?",
				CANVAS_WIDTH / 2 - playW / 2, 256, playW, 32, 0, true);
	}
	// Find if any buttons are pressed
	for (var i = 0; i < this.buttons.length; i++) {
		// Press button behaviour
		if (mouseDown &&
			mouseLoc.x >= this.buttons[i].xOrig / 32 - 1 &&
			mouseLoc.x <=
			(this.buttons[i].xOrig + this.buttons[i].width) / 32 - 2 &&
			mouseLoc.y === this.buttons[i].yOrig / 32 - 1) {
			this.buttons[i].offset = 2;
		}
		else {
			this.buttons[i].offset = 0;
		}
		// Check if Play button is pressed
		if (userClick && isGameOver &&
			mouseLoc.x >= 2 && mouseLoc.x <= 5 && mouseLoc.y === 7) {
			// If game has ended, send resetRequest to engine
			if (isGameOver && !isReady) {
				resetRequest = true;
			}
			// Otherwise (at the intro screen) begin game and dismiss overlay
			isGameOver = false;
			this.isVisible = false;
			this.buttons[i].isVisable = false;
		}

	}
	// Click anywhere to dismiss other popup overlays
	if (!isGameOver && mouseDown) {
		this.isVisible = false;
	}
};

// Render Overlay screen
Overlay.prototype.render = function() {
	if (this.isVisible) {
		this.print();
	}
};

// Initialize overlay for start game screen
Overlay.prototype.start = function() {
	// Set overlay size
	this.width = CANVAS_WIDTH - 32;
	this.height = CANVAS_HEIGHT - 32;
	this.xOrig = (CANVAS_WIDTH - this.width) / 2;
	this.yOrig = (CANVAS_HEIGHT - this.height) / 2;

	// Set title image
	this.sprite = Resources.get('images/title.png');
	this.sprite.width =  280;
	this.sprite.height = 88;

	// Set title message
	// this.message = 'Click anywhere to play';
	// this.messageX = 32;
	// this.messageY = 250;
	// this.messageFont =  'bold 18px Courier';
	// this.messageStyle = '#4F2E0F';

	// Set start button
	var startW = 128
	this.createButton("Start!", CANVAS_WIDTH / 2 - startW / 2, 256, startW, 32, 0, true);
};

// Overlay for a pop-up message, takes string for message
Overlay.prototype.popup = function(mString) {
	// Set overlay size
	this.width = CANVAS_WIDTH - 32;
	this.height = 288;
	this.xOrig = 16;
	this.yOrig = 16;

	// Set message and placement
	this.message = mString;
	this.messageX = 32;
	this.messageY = 128 + 32;
	this.messageFont =  'bold 18px Courier';
	this.messageStyle = '#4F2E0F';

	// Eliminate image
	this.sprite = '';

	overlay.isVisible = true;
};

// Creates buttons on-demand to use in the overlay
Overlay.prototype.createButton = function(text, xOrig, yOrig, w, h, o, visable) {
	this.buttons.push(
		{
			'text' : text,
			'xOrig' : xOrig,
			'yOrig' : yOrig,
			'width' : w,
			'height' : h,
			'offset' : o,
			'isVisable' : visable
		});
};

// Print overlay to canvas
Overlay.prototype.print = function() {
	// Print overlay background
	ctx.fillStyle = '#fff';
	ctx.strokeStyle = '#000';
	ctx.globalAlpha = 0.9;
	ctx.fillRect(this.xOrig, this.yOrig, this.width, this.height);
	ctx.strokeRect(this.xOrig, this.yOrig, this.width, this.height);
	// Print image, if any
	if (this.sprite) {
		ctx.drawImage(
			this.sprite,
			(CANVAS_WIDTH - this.sprite.width) / 2,
			this.yOrig + 32,
			this.sprite.width,
			this.sprite.height);
	}
	// Print Message, if any
	if (this.message) {
		ctx.fillStyle = this.messageStyle;
		ctx.font = this.messageFont;
		ctx.textAlign = "center";
		ctx.fillText(this.message, CANVAS_WIDTH / 2, this.messageY);
	}
	// Print buttons, if any
	if (this.buttons) {
		for (var i = 0; i < this.buttons.length; i++) {
			if (this.buttons[i].isVisable) {
			// Draw backing
			ctx.globalAlpha = 1;
			// Drop Shadow
			ctx.fillStyle = '#4F2E0F';
			ctx.fillRect(
				this.buttons[i].xOrig + this.shadowOffset,
				this.buttons[i].yOrig + this.shadowOffset,
				this.buttons[i].width,
				this.buttons[i].height
			);
			ctx.fillStyle = '#fff';
			ctx.fillRect(
				this.buttons[i].xOrig + this.buttons[i].offset,
				this.buttons[i].yOrig + this.buttons[i].offset,
				this.buttons[i].width,
				this.buttons[i].height
			);
			ctx.strokeStyle = '#4F2E0F';
			ctx.strokeRect(
				this.buttons[i].xOrig + this.buttons[i].offset,
				this.buttons[i].yOrig + this.buttons[i].offset,
				this.buttons[i].width,
				this.buttons[i].height
			);
			// Draw button text
			ctx.fillStyle = '#4F2E0F';
			ctx.textAlign = 'center';
			ctx.font = 'bold 18px Courier';
			var center = this.buttons[i].width / 2;
			ctx.fillText(
				this.buttons[i].text,
				this.buttons[i].xOrig + center + this.buttons[i].offset,
				this.buttons[i].yOrig + 22 + this.buttons[i].offset
			);
			}
		}
	}
};

/**
 * Instantiate players and boards
 */
var player1, player2, board, ghostBoard;

// Create a fresh game state, called by the engine
// at the beginning of every new game
function initGame() {
    // Set game state to not over
    isGameOver = true;
    // Is ready is reset
    isReady = true;
    resetRequest = false;
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
	player2.isABot = true;
	// Set turn to 0
	turn = 'black';
    // Make the scoreboard
    score = new Scoreboard();
    score.firstTime = true;
    // Make overlay
    overlay = new Overlay();
}