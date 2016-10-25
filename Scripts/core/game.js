/// <reference path="_reference.ts" />
/**
 *
 * @author Kevin Ma
 * @date Oct 24 2016
 * @description Based on the Atari classic, Breakout. Hands-on Project of Chapter 4 in Apress
 * Beginning HTML5 Games with CreateJS 2014
 *      -Progressive mode, continuously adding rows of bricks as the game progresses
 *      -Graphics built 100% using EaselJS's drawing API and Text objects
 *      -TweenJS library used to animate some of the bonus text during gameplay
 *      -All controls handled by k/b => move paddle, pause or play the game
 */
(function () {
    //GAME VARIABLES ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //stage and game visuals
    var canvas, stage, paddle, puck, board, scoreTxt, livesTxt, messageTxt, messageInterval;
    //game controls
    var leftWall, rightWall, ceiling, floor;
    //initialized variables - should be reset when restarting the game
    var leftKeyDown = false;
    var rightKeyDown = false;
    var bricks = []; // starts empty, references all bricks created in the game
    var paddleHits = 0; //determine when a new level should be added to the board
    var combo = 0; //# rows destroyed before hitting the paddle
    var lives = 5;
    var score = 0;
    var level = 0;
    var gameRunning = true; //true? spacebar = pause game : spacebar = restart game 
    //level data - each index in the levels array holds an obj that determines the color of bricks and the pts
    //each one is worth when busted
    var levels = [
        { color: '#705000', points: 1 },
        { color: '#743fab', points: 2 },
        { color: '#4f5e04', points: 3 },
        { color: '#1b5b97', points: 4 },
        { color: '#c6c43b', points: 5 },
        { color: '#1a6d68', points: 6 },
        { color: '#aa7223', points: 7 },
        { color: '#743fab', points: 8 },
        { color: '#4f5e04', points: 9 },
        { color: '#1b5b97', points: 10 },
        { color: '#c6c43b', points: 11 },
        { color: '#1a6d68', points: 12 }
    ];
    //GAME INITIALIZATION +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    function init() {
        canvas = document.getElementById('canvas');
        stage = new createjs.Stage(canvas);
        newGame();
        startGame();
    }
    function newGame() {
        buildWalls();
        buildMessageBoard();
        buildPaddle();
        buildPuck();
        setControls();
        newLevel();
        newLevel();
    }
    //Creating the Walls
    function buildWalls() {
        //drawing the left wall
        var wall = new createjs.Shape();
        wall.graphics.beginFill('#333')
            .drawRect(0, 0, config.Game.WALL_THICKNESS, canvas.height);
        stage.addChild(wall);
        //drawing the right wall
        wall = new createjs.Shape();
        wall.graphics.beginFill('#333')
            .drawRect(0, 0, config.Game.WALL_THICKNESS, canvas.height);
        wall.x = canvas.width - config.Game.WALL_THICKNESS;
        stage.addChild(wall);
        //drawing the ceiling
        wall = new createjs.Shape();
        wall.graphics.beginFill('#333')
            .drawRect(0, 0, canvas.width, config.Game.WALL_THICKNESS);
        stage.addChild(wall);
        //setting values for the properties, makes it easier to reference later
        leftWall = config.Game.WALL_THICKNESS;
        rightWall = canvas.width - config.Game.WALL_THICKNESS;
        ceiling = config.Game.WALL_THICKNESS;
    }
    //Creating the Message board - displays various game messages
    function buildMessageBoard() {
        //message board at bottom of screen, above the floor where paddel rests
        board = new createjs.Shape();
        board.graphics.beginFill('#333')
            .drawRect(0, 0, canvas.width, config.Game.SCORE_BOARD_HEIGHT);
        board.y = canvas.height - config.Game.SCORE_BOARD_HEIGHT;
        stage.addChild(board);
        //lives text
        livesTxt = new createjs.Text('lives: ' + lives, '20px Times', '#fff');
        livesTxt.y = board.y + 10;
        livesTxt.x = config.Game.WALL_THICKNESS;
        stage.addChild(livesTxt);
        //score text
        scoreTxt = new createjs.Text('score: ' + score, '20px Times', '#fff');
        scoreTxt.textAlign = 'right';
        scoreTxt.y = board.y + 10;
        scoreTxt.x = canvas.width - config.Game.WALL_THICKNESS;
        stage.addChild(scoreTxt);
        //message text
        messageTxt = new createjs.Text('press spacebar to pause', '18px Times', '#fff');
        messageTxt.textAlign = 'center';
        messageTxt.y = board.y + 10;
        messageTxt.x = canvas.width / 2;
        stage.addChild(messageTxt);
    }
    //Creating the Paddle and puck
    function buildPaddle() {
        paddle = new createjs.Shape();
        paddle.width = config.Game.PADDLE_WIDTH;
        paddle.height = 20;
        paddle.graphics.beginFill('#3e6dc0')
            .drawRect(0, 0, paddle.width, paddle.height);
        paddle.nextX = 0;
        paddle.x = 20;
        paddle.y = canvas.height - paddle.height - config.Game.SCORE_BOARD_HEIGHT;
        stage.addChild(paddle);
    }
    function buildPuck() {
        puck = new createjs.Shape();
        puck.graphics.beginFill('#fff')
            .drawRect(0, 0, 10, 10);
        puck.width = 10;
        puck.height = 10;
        puck.x = canvas.width - 100;
        puck.y = 160;
        puck.velX = puck.velY = config.Game.PUCK_SPEED;
        puck.isAlive = true;
        //adds the puck to the botom layer of the stage 
        //this ensures that it travels under the scoreboard when it flies out of bounds 
        //beneath the floor
        stage.addChildAt(puck, 0);
    }
    //Adding controls
    function setControls() {
        window.onkeydown = handleKeyDown;
        window.onkeyup = handleKeyUp;
    }
    function handleKeyDown(e) {
        switch (e.keyCode) {
            case config.Game.ARROW_KEY_LEFT:
                leftKeyDown = true;
                break;
            case config.Game.ARROW_KEY_RIGHT:
                rightKeyDown = true;
                break;
        }
    }
    function handleKeyUp(e) {
        switch (e.keyCode) {
            case config.Game.ARROW_KEY_LEFT:
                leftKeyDown = false;
                break;
            case config.Game.ARROW_KEY_RIGHT:
                rightKeyDown = false;
                break;
            case config.Game.SPACE_KEY:
                if (gameRunning) {
                    createjs.Ticker.setPaused(createjs.Ticker.getPaused() ? false
                        : true);
                }
                else {
                    resetGame();
                }
                break;
        }
    }
    //Adding Levels 
    function newLevel() {
        var i, brick, freeLifeTxt;
        var data = levels[level];
        var xPos = config.Game.WALL_THICKNESS;
        var yPos = config.Game.WALL_THICKNESS;
        var freeLife = Math.round(Math.random() * 20);
        paddleHits = 0;
        shiftBricksDown();
        for (i = 0; i < 20; i++) {
            brick = new createjs.Shape();
            brick.graphics.beginFill(i == freeLife ? '#009900' : data.color);
            brick.graphics.drawRect(0, 0, 76, 20);
            brick.graphics.endFill();
            brick.width = 76;
            brick.height = 20;
            brick.x = xPos;
            brick.y = yPos;
            brick.points = data.points;
            brick.freeLife = false;
            bricks.push(brick);
            stage.addChild(brick);
            if (i == freeLife) {
                freeLifeTxt = new createjs.Text('1UP', '12px Times', '#fff');
                freeLifeTxt.x = brick.x + (brick.width / 2);
                freeLifeTxt.y = brick.y + 4;
                freeLifeTxt.width = brick.width;
                freeLifeTxt.textAlign = 'center';
                brick.freeLife = freeLifeTxt;
                stage.addChild(freeLifeTxt);
            }
            xPos += 76;
            //move to next line if more than 10th brick
            if (xPos > (brick.width * 10)) {
                xPos = config.Game.WALL_THICKNESS;
                yPos += brick.height;
            }
        }
        level++;
        //only so many levels in the levels array, so you continue to use the last data object 
        //for the remainder of the game by decreasing the level by one
        if (level == levels.length) {
            level--;
        }
    }
    //Shifting the Bricks - make room for subsequent levels
    function shiftBricksDown() {
        var i, brick;
        var shiftHeight = 80;
        var len = bricks.length;
        for (i = 0; i < len; i++) {
            brick = bricks[i];
            brick.y += shiftHeight;
            //shifts the free life text objects tied to a brick 
            if (brick.freeLife) {
                brick.freeLife.y += shiftHeight;
            }
        }
    }
    //GAME LOOP +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    function startGame() {
        createjs.Ticker.framerate = 60;
        createjs.Ticker.on('tick', function (e) {
            if (!e.paused) {
                runGame();
                stage.update();
            }
        });
    }
    function runGame() {
        //executes the update/render cycle
        update();
        render();
        //determines end level and/or end game scenarios
        evalPuck();
        evalGame();
    }
    window.onload = init;
})();
//# sourceMappingURL=game.js.map