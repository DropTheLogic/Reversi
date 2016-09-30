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
var waitTime = .25;
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

/**
 * Returns random integer
 * @param {integer} min - inclusive
 * @param {integer} max - exclusive
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Hold turn (by player piece color)
var turn;

// Holds move request coordinates and current mouse coordinates
var moveRequest = {};
var mouseLoc = {};
var mouseDown = false;

// Allows visible pieces previewing move
var allowGhosts = true;
// Size and placement of on/off toggle
var ghostOnX = space.width * 7;
var ghostOnY = space.height * 12;
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
	this.indent = ''; // For debugging, allows to view recursive move scores
	this.spaces = new Array(this.rows);
	this.isAGhost = isAGhost;
    this.hasLegalMoves = true;
};

// Initialize board matrix
Board.prototype.initBoard = function() {
	// Initialize matrix size
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
	var difficulty =
		(turn === player1.color) ? player1.difficulty : player2.difficulty;
	var highestValue = -999999;
	var highestIndex = 0;

	// Create array of available legal moves
	var legalSpaces = this.findLegalSpaces();

	// Create array to record values of each legal move. Each element in the
	// array will be an array itself, [value, index], containing the value of
	// the move and then index of the move in the legalSpaces array
	var spaceValues = [];

	// Calculate the amount of value added by each move.
	var vCorner;
	var vCornerAd;
	var vEdge;
	var vSpace;
	switch(difficulty) {
		case 1 :
			vCorner = 44;
			vCornerAd = -12;
			vEdge = 5;
			vSpace = 2;
			break;
		case 2 :
			vCorner = 64;
			vCornerAd = -24;
			vEdge = 4;
			vSpace = 1;
			break;
		case 3 :
			vCorner = 90;
			vCornerAd = -20;
			vEdge = 5;
			vSpace = 1;
			break;
		default :
			vCorner = 40;
			vCornerAd = -2;
			vEdge = 5;
			vSpace = 2;
			break;
	};

	if (moves > 0) {
		console.log(this.indent + "**************** " + turn + "'s turn ****************");
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

		//console.log(this.indent + "On " + turn + "'s turn, proposed move is (" +
		//		legalSpaces[index].x + ", " + legalSpaces[index].y + ")");

		// Take virtual turns according to how many moves ahead to look
		// How far to allow recursive vision
		var movesToLookAhead = moves;
		if (movesToLookAhead > 0) {
			// Create indent character, for debugging
			this.indent += '>';

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

			// Adjust indent, for console debugging
			var iL = this.indent.length - 1;
			this.indent = this.indent.substring(0, iL);
		}

		// Cycle through spaces on the board and tally values
		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				// If a piece is found on the board, calculate it's value
				if (this.spaces[i][j] != undefined) {
					// If piece lies on a corner
					if ((i === 0 && j === 0) || (i === 0 && j === 7) ||
						(i === 7 && j === 0) || (i === 7 && j === 7)) {
						(this.spaces[i][j] === myTurn) ?
							value += vCorner : value -= vCorner;
					}
					// If piece lies adjacent to a corner (negatively valued)
					if ((i === 0 && j === 1) || (i === 1 && j === 1) ||
						(i === 1 && j === 0) || (i === 0 && j === 6) ||
						(i === 1 && j === 6) || (i === 1 && j === 7) ||
						(i === 6 && j === 0) || (i === 6 && j === 1) ||
						(i === 7 && j === 1) || (i === 6 && j === 7) ||
						(i === 6 && j === 6) || (i === 7 && j === 6)) {
						(this.spaces[i][j] === myTurn) ?
							value += vCornerAd : value -= vCornerAd;
					}
					// If piece lies on the upper or bottom border
					if (i === 0 || i === 7) {
						(this.spaces[i][j] === myTurn) ?
						value += vEdge : value -= vEdge;
					}
					// If piece lies on the left or right border
					if (j === 0 || j === 7) {
						(this.spaces[i][j] === myTurn) ?
						value += vEdge : value -= vEdge;
					}
					// If piece is anywhere else
					else {
						(this.spaces[i][j] === myTurn) ?
						value += vSpace : value -= vSpace;
					}
				}
			}
		}

		//console.log(this.indent + "value for " + turn + ": " + value);

		// Subtract current number of pieces from value to show value added
		//value -= currentScore;

		// Add value to array
		spaceValues.push([value, index]);

		// Revert board back to original state
		copyArray(currentState, this.spaces);
	}

	// Sort moves by increasing value (bubble sort, looking at a 2D array)
	for (var i = 0; i < spaceValues.length; i++) {
		for (var j = 0; j < (spaceValues.length - i - 1); j++) {
			// Compare scores
			if (spaceValues[j][0] > spaceValues[j + 1][0]) {
				// Swap places
				var tempArr = spaceValues[j];
				spaceValues[j] = spaceValues[j + 1];
				spaceValues[j + 1] = tempArr;
			}
		}
	}

	console.log(this.indent + 'Moves:');
	for (var i = 0; i < spaceValues.length; i++) {
		console.log(this.indent + spaceValues[i]);
	}

	// Pick move to play
	// Find distinct values, and store indexes of each one in array
	var distIndexes = [];
	distIndexes.push(0);
	for (var i = 1; i < spaceValues.length; i++) {
		// Check if current value is different from previous one
		if (spaceValues[i][0] != spaceValues[i - 1][0]) {
			// Add index to collection
			distIndexes.push(i);
		}
	}

	// Pick highest value move
	// Start by picking the final/highest value in the spaceValues array
	var decision = spaceValues[spaceValues.length - 1];
	// If more than one legal move exists, pick randomly from highest
	// equivalently valued moves, if multiple exist
	if (spaceValues.length > 1) {
		// Set minimum index, by finding index of the first occurrence of
		// highest value move (which is the final element in the
		// distIndexes array)
		var min = distIndexes[distIndexes.length - 1];
		// If difficulty is set low, amd there are at least three tiers
		// move-scores, choose between best or second best instead of
		// always picking the best move
		if (difficulty < 2 && distIndexes.length > 3) {
			min = distIndexes[distIndexes.length - 2]
		}
		// Max index will be the length of the spaceValues array (which,
		// in the getRandomInt function, is exclusive)
		var max = spaceValues.length;
		console.log(this.indent + 'Randomly finding move between ' +
			spaceValues[min] + ' and ' + spaceValues[max - 1]);
		// Find random index
		var randomIndex = getRandomInt(min, max);
		// Set decision to move of randomIndex in spaceValues array
		decision = spaceValues[randomIndex];
	}

	console.log('Difficulty is set to ' + difficulty);
	console.log(this.indent + 'Picking ' + decision + ' to play');

	// Return move to be played
	return legalSpaces[decision[1]];
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
		var player = (turn === player1.color) ? player1 : player2;
		var movesAhead = 1;
		switch(player.difficulty) {
			case 1: movesAhead = 0; break;
			case 2: movesAhead = 1; break;
			case 3: movesAhead = 2; break;
			default : movesAhead = 1;
		};
		moveRequest = this.getAiMove(movesAhead);

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
	// Object describing scoreboard button locations and actions
	var buttonLocs = {
		'ghostMovesOn' : {'x' : 6, 'y' : 11,
			'action' : function() {allowGhosts = true;}},
		'ghostMovesOff' : {'x' : 7, 'y' : 11,
			'action' : function() {allowGhosts = false;}},
		'player1CPU' : {'x' : 1, 'y' : 13,
			'action' : function() {player1.isABot = true;}},
		'player1Human' : {'x' : 2, 'y' : 13,
			'action' : function() {player1.isABot = false;}},
		'player2CPU' : {'x' : 6, 'y' : 13,
			'action' : function() {player2.isABot = true;}},
		'player2Human' : {'x' : 7, 'y' : 13,
			'action' : function() {player2.isABot = false;}},
		'p1Easy' : {x : 0, y : 14,
			'action' : function() {player1.difficulty = 1}},
		'p1Reg' : {x : 1, y : 14,
			'action' : function() {player1.difficulty = 2}},
		'p1Hard' : {x : 2, y : 14,
			'action' : function() {player1.difficulty = 3}},
		'p2Easy' : {x : 5, y : 14,
			'action' : function() {player2.difficulty = 1}},
		'p2Reg' : {x : 6, y : 14,
			'action' : function() {player2.difficulty = 2}},
		'p2Hard' : {x : 7, y : 14,
			'action' : function() {player2.difficulty = 3}},
		'reset' : {'name' : 'reset', 'x' : 0, 'y' : 11,
			'action' : function() {
				var buttonWidth = space.width * 2;
				overlay.isVisible = true;
				overlay.sprite = '';
				overlay.message = "Really restart new game?";
				overlay.messageX = 32;
				overlay.messageY = 128 + 96;
				overlay.messageFont =  'bold 18px Courier';
				overlay.messageStyle = '#4F2E0F';
				overlay.createButton("Yes",
					space.width * 2, 256, buttonWidth, 32, 0, true,
					function() {
						mouseLoc = {};
						resetRequest = true;
					});
				overlay.createButton("No",
					space.width * 6, 256, buttonWidth, 32, 0, true,
					function() {
						mouseLoc = {};
						overlay.isVisible = false;
					});
			}},
		'undo' : {'name' : 'undo', 'x' : 3, 'y' : 11,
			'action' : function() {
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
			}}
	};

	// Check if user is clicking a button on the scoreboard
	for (var key in buttonLocs) {
		var button = buttonLocs[key];
		if (userClick && !overlay.isVisible) {
			if (((button.name === 'reset' || button.name === 'undo') &&
				move.x >= button.x && move.x <= button.x + 1 && move.y === button.y) ||
				(move.x >= button.x && move.x < button.x + 1 &&
				move.y >= button.y && move.y < button.y + 1 && !isGameOver))
				button.action();
		}
	}

	// Check if move is in bounds and not already taken
	if (move.x < this.cols &&
		move.x >= 0 &&
		move.y < this.rows &&
		move.y >= 0 &&
		this.spaces[move.x][move.y] === undefined && !isGameOver && !overlay.isVisible) {

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
	this.difficulty = 1;
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
 * Scoreboard Class, which will display scores and other UI information
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
	this.printToggle('Ghost Moves', allowGhosts, space.width * 7, space.height * 12);

	// Print reset button
	this.printButton('Reset Game', 1);

	// Print undo button
	this.printButton('Undo', 4);

	// Print player1 CPU button
	this.printToggle('P1 CPU', player1.isABot, space.width * 2, space.height * 14);

	// Print player2 CPU button
	this.printToggle('P2 CPU', player2.isABot, space.width * 7, space.height * 14);

	// Print difficulty LED / buttons
	this.printLEDs(player1);
	this.printLEDs(player2);
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
 * Prints Toggle Button with a label describing what it does
 * @param {string} label - the text to display under toggle button
 * @param {boolean} condition - boolean condition to toggle on and off
 * @param {integer} xPos - an integer corresponding to the space on the
 * board under-which to left-align the button
 * @param {integer} yPos - an integer corresponding to the space on the
 * board where to top-align the the toggle button
 */
Scoreboard.prototype.printToggle = function(label, condition, xPos, yPos) {
	ctx.font = 'bold 12px Courier';
	ctx.fillStyle = '#000'; // For black text
	// CPU text should appear to the side, rather than below
	var CPUloc = label.indexOf('CPU');
	if (CPUloc >= 0) {
		var label1 = label.slice(0, CPUloc);
		var label2 = label.slice(CPUloc, label.length);
		ctx.fillText(label1, xPos - 28, yPos + 10);
		ctx.fillText(label2, xPos - 28, yPos + 22);
	}
	else {
		ctx.fillText(label, xPos - 6, yPos + 38);
	}

	// Display toggle sprite from sprite sheet
	var toggleSprite = Resources.get('images/switch.png');
	// Select position of appropriate sprite from sheet
	var onY = (condition) ? 0 : 70;
	ctx.drawImage(toggleSprite, 0, onY, 127, 54, xPos, yPos, 64, 27);
};

/**
 * Prints Button with a label describing what it does
 * @param {string} label - the text to display under button
 * @param {integer} xPosSpace - an integer corresponding to the space on the
 * board under-which to left-align the button
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
	var buttonSprite = Resources.get((mouseDown && mouseLoc.y === 11 &&
									  (mouseLoc.x >= xPosSpace - 1 &&
									  mouseLoc.x <= xPosSpace)) ?
									 'images/buttonPress.png' :
									 'images/button.png');
	ctx.drawImage(buttonSprite, space.width * xPosSpace, ghostOnY, 64, 26);
};

/**
 * Prints 3 LED lights per player, to display and change current AI difficulty
 * @param {object} player - object holds color and difficulty parameters
 */
Scoreboard.prototype.printLEDs = function(player) {
	// Display label
	ctx.font = 'bold 12px Courier';
	ctx.fillStyle = '#000';
	ctx.textAlign = 'left';
	var labelAlign =
		(player.color === 'black') ? 4 + space.width : 4 + space.width * 6;
	ctx.fillText('Difficulty:', labelAlign, 488);

	var w = 16;
	var x = (player.color === 'black') ? (w / 2) : space.width * 5 + (w / 2);

	// Depending on current difficulty, display an "off" LED or colored one
	for (var i = 1, led; i <= 3; i++) {
		if (player.difficulty === 1 && player.difficulty === i) {
			led = Resources.get('images/LED_g.png'); // Green Light
		}
		else if (player.difficulty === 2 && player.difficulty === i) {
			led = Resources.get('images/LED_y.png'); // Yellow Light
		}
		else if (player.difficulty === 3 && player.difficulty === i) {
			led = Resources.get('images/LED_r.png'); // Red Light
		}
		else led = Resources.get('images/LED_off.png'); // Light Off
		ctx.drawImage(led, x += space.width, 490, w, w);
	}
}

/**
 * Overlay class, used to print entire pages or screens over-top of the
 * gameboard. Use to display messages or for end of game or start screens.
 * @constructor
 */
var Overlay = function() {
	this.buttons = [];
	this.shadowOffset = 2;
	this.start();
	this.isVisible = true;
	this.clickToDismiss = false;
};

// Update overlay variables
Overlay.prototype.update = function(dt) {
	// Update states
	if (isGameOver && !isReady) {
			// Create Play again buttons
			// TODO: Stop making new buttons every frame!!
			var playW = 128;
			this.createButton("Play Again?",
				CANVAS_WIDTH / 2 - playW / 2, 256, playW, 32, 0, true, function() {
					if (isGameOver && !isReady) {
						resetRequest = true;
					}
				});
	}
	// Find if any buttons are pressed
	for (var i = 0; i < this.buttons.length; i++) {
		// Press button behavior
		if (mouseDown &&
			mouseLoc.x >= this.buttons[i].xOrig / 32 - 1 &&
			mouseLoc.x <=
			(this.buttons[i].xOrig + this.buttons[i].width) / 32 - 2 &&
			mouseLoc.y === this.buttons[i].yOrig / 32 - 1) {
			this.buttons[i].offset = 2;
		}
		// Button depress behaviour
		else {
			// Reset button to raised location
			this.buttons[i].offset = 0;
			// If button is "clicked" (mouse released over it), then take action
			if (mouseLoc.x >= this.buttons[i].xOrig / 32 - 1 &&
				mouseLoc.x <=
				(this.buttons[i].xOrig + this.buttons[i].width) / 32 - 2 &&
				mouseLoc.y === this.buttons[i].yOrig / 32 - 1) {
				if (this.isVisible && this.buttons[i].action && userClick) {
					this.buttons[i].action();
				}
			}
		}
	}
	// Click anywhere to dismiss other pop-up overlays
	if (this.clickToDismiss && !isGameOver && mouseDown) {
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
	this.createButton("Start!", CANVAS_WIDTH / 2 - startW / 2, 256, startW, 32, 0, true,
		function() {
			// Begin game and dismiss overlay
			isGameOver = false;
			overlay.isVisible = false;
			// Remove this button
			overlay.buttons.splice(overlay.buttons.indexOf(this), 1);
		});
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

	this.clickToDismiss = true;
	overlay.isVisible = true;
};

/**
 * Creates buttons to use in the overlay, pushes to buttons array
 * @param {string} text - the text to display on button
 * @param {integer} xOrig - x origin coordinate for button, left aligned
 * @param {integer} yOrig - y origin coordinate for button, top aligned
 * @param {integer} w - width of button, in pixels
 * @param {integer} h - height of button, in pixels
 * @param {integer} o - number of pixels to offset button once pressed
 * @param {boolean} visible - whether to display button
 * @param {function} action - function to be called upon button press
 */
Overlay.prototype.createButton = function(text, xOrig, yOrig, w, h, o, visible, action) {
	this.buttons.push(
		{
			'text' : text,
			'xOrig' : xOrig,
			'yOrig' : yOrig,
			'width' : w,
			'height' : h,
			'offset' : o,
			'isVisable' : visible,
			'action' : action
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
	player1.isABot = false;
	player2.isABot = true;
	// Set turn to 0
	turn = 'black';
    // Make the scoreboard
    score = new Scoreboard();
    score.firstTime = true;
    // Make overlay
    overlay = new Overlay();
}