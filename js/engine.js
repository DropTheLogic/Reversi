/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        lastTime,
        speedUpFX;

    /* Determines pixel density of screen and creates canvas accordingly
     */
    var PIXEL_RATIO = (function () {
        var ctx = document.createElement("canvas").getContext("2d"),
            dpr = window.devicePixelRatio || 1,
            bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

        return dpr / bsr;
    })();

    createHiDPICanvas = function(w, h, ratio) {
        if (!ratio) { ratio = PIXEL_RATIO; }
        var can = doc.createElement("canvas");
        can.width = w * ratio;
        can.height = h * ratio;
        can.style.width = w + "px";
        can.style.height = h + "px";
        can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
        return can;
    }

    // Create canvas with the device resolution.
    var canvas = createHiDPICanvas(CANVAS_WIDTH, CANVAS_HEIGHT),
        ctx = canvas.getContext('2d');

    canvas.className = 'game';
    canvas.id = 'myCanvas';
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* This alters delta to speed-up time while in the game over screen
         */
        speedUpFX = 1000;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        // First, check if game is over, kick the loop to the gameOverScreen
        if (isGameOver) {
            win.requestAnimationFrame(gameOverScreen);
        }
        else {
            win.requestAnimationFrame(main);
        }
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        score.update(dt);
        board.update(dt);
        ghostBoard.update(dt);
        //messages.update(dt);
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var wood = 'images/wood.png',
            numRows = 10,
            numCols = 10,
            row, col;
        var sprite = { 'x' : 0, 'y' : 0 };

        // Define gameboard tile position (x, y) from the sprite sheet
        var sheetB = {
            'borderTopLeft' : { 'x' : 64, 'y' : 0 },
            'borderTop' : { 'x' : 96, 'y' : 0 },
            'borderTopRight' : { 'x' : 128, 'y' : 0 },
            'borderLeft' : { 'x' : 64, 'y' : 32 },
            'borderRight' : { 'x' : 128, 'y' : 32 },
            'borderBotLeft' : { 'x' : 64, 'y' : 64 },
            'borderBottom' : { 'x' : 96, 'y' : 64 },
            'borderBotRight' : { 'x' : 128, 'y' : 64 },
            'spaceLightVert' : { 'x' : 0, 'y' : 0 },
            'spaceLightHor' : { 'x' : 32, 'y' : 0 },
            'spaceMedVert' : { 'x' : 0, 'y' : 32 },
            'spaceMedHor' : { 'x' : 32, 'y' : 32 },
            'spaceGreenMH' : { 'x' : 192, 'y' : 32 },
            'spaceGreenMV' : { 'x' : 160, 'y' : 32 },
            'spaceGreenDH' : { 'x' : 192, 'y' : 64 },
            'spaceGreenDV' : { 'x' : 160, 'y' : 64 }
        };

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                // Find which sprite is needed for current space
                // First, make the general grid
                // Find if row number is even
                if (row % 2 === 0) {
                    // and column number is even, put light space
                    sprite = (col % 2 === 0) ?
                        sheetB.spaceGreenDH : sheetB.spaceGreenDV;
                }
                // If row number is odd,
                else {
                    // If column number is even, put darker space
                    sprite = (col % 2 === 0) ?
                        sheetB.spaceGreenDV : sheetB.spaceGreenDH;
                }
                // Second, make the borders
                // Top border
                if (row === 0) {
                    sprite = (col === 0) ? sheetB.borderTopLeft :
                        ((col < (numCols - 1)) ?
                            sheetB.borderTop : sheetB.borderTopRight);
                }
                // Left Side
                else if (col === 0) {
                    sprite = (row === numRows - 1) ?
                        sheetB.borderBotLeft : sheetB.borderLeft;
                }
                // Right Side
                else if (col === numCols - 1) {
                    sprite = (row === numRows - 1) ?
                        sheetB.borderBotRight : sheetB.borderRight;
                }
                // Bottom
                else if (row === numRows - 1) {
                    sprite = sheetB.borderBottom;
                }

                ctx.drawImage(
                    Resources.get(wood),
                    sprite.x, sprite.y,
                    space.height, space.width,
                    col * space.height, row * space.width,
                    space.height, space.width);
            }
        }

        // Render Scoreboard
        ctx.globalAlpha = 1;
        score.render();

        // Render player and enemies
        renderEntities();

        // Render any Messages
        //messages.render();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        board.render();
        if (allowGhosts) {
            ghostBoard.render();
        }
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        initGame();
    }

    /* Adds a game over display loop, beginning when the player has
     * run out of lives and ends when they press any key
     */
    function gameOverScreen() {
        // Let's speed up the simulation for some fun...
        // Change the delta time by a lot
        // Gradually make delta larger, to a point
        speedUpFX = (speedUpFX < 25) ? 25 : speedUpFX *= 0.99;

        var now = Date.now(),
            dt = (now - lastTime) / speedUpFX;
        update(dt);
        render();

        // Print out game over announcements
        showGameOver();

        // Repeat loop, in this case, until user presses any button
        lastTime = now;

        win.requestAnimationFrame((isReady) ? init : gameOverScreen);
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/checker.png',
        'images/wood.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
