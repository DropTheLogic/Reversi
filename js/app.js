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
		'y' : Math.floor(y / space.height)};
	console.log('x: ' + moveRequest.x + ', y: ' + moveRequest.y);
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
	this.handleInput(moveRequest);
};

// Account for user input
Player.prototype.handleInput = function(move) {
	// Check if move is in bounds
	if (move.x < board.cols &&
		move.x >= 0 &&
		move.y < board.rows &&
		move.y >= 0) {
		//Check if move is legal

		// Place user token in spot
		board.spaces[move.x][move.y] = this.color;
	}
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
    // Make the scoreboard
    //score = new Scoreboard();
}