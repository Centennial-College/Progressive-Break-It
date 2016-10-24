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
        // buildPaddle();
        // buildPuck();
        // setControls();
        // newLevel();
        // newLevel();
    }
    function startGame() {
        createjs.Ticker.framerate = 60;
        createjs.Ticker.on('tick', function (e) {
            if (!e.paused) {
                stage.update();
            }
        });
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
    window.onload = init;
})();
//# sourceMappingURL=game.js.map