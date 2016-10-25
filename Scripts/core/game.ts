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
    let canvas, stage: createjs.Stage, paddle: createjs.Shape, puck: createjs.Shape, board: createjs.Shape,
        scoreTxt: createjs.Text, livesTxt: createjs.Text, messageTxt: createjs.Text, messageInterval;

    //game controls
    let leftWall, rightWall, ceiling, floor;

    //initialized variables - should be reset when restarting the game
    let leftKeyDown = false;
    let rightKeyDown = false;
    let bricks = [];    // starts empty, references all bricks created in the game
    let paddleHits = 0; //determine when a new level should be added to the board
    let combo = 0;  //# rows destroyed before hitting the paddle
    let lives = 5;
    let score = 0;
    let level = 0;

    let gameRunning = true; //true? spacebar = pause game : spacebar = restart game 

    //level data - each index in the levels array holds an obj that determines the color of bricks and the pts
    //each one is worth when busted
    let levels = [
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
    ]

    //GAME INITIALIZATION +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    function init() {
        canvas = document.getElementById('canvas');
        stage = new createjs.Stage(canvas);
        newGame();
        startGame();
    }

    function newGame(): void {
        buildWalls();
        buildMessageBoard();
        buildPaddle();
        buildPuck();
        setControls();
        newLevel();
        newLevel();
    }

    //Creating the Walls
    function buildWalls(): void {
        //drawing the left wall
        let wall = new createjs.Shape();
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
    function buildMessageBoard(): void {
        //message board at bottom of screen, above the floor where paddel rests
        board = new createjs.Shape();
        board.graphics.beginFill('#333')
            .drawRect(0, 0, canvas.width, config.Game.SCORE_BOARD_HEIGHT);
        board.y = canvas.height - config.Game.SCORE_BOARD_HEIGHT;
        stage.addChild(board)

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
    function buildPaddle(): void {
        paddle = new createjs.Shape();
        paddle.width = config.Game.PADDLE_WIDTH;
        paddle.height = 20;
        paddle.graphics.beginFill('#3e6dc0')
            .drawRect(0, 0, paddle.width, paddle.height);
        paddle.nextX = 0;
        paddle.x = 20;
        paddle.y = canvas.height - paddle.height - config.Game.SCORE_BOARD_HEIGHT;
        stage.addChild(paddle)
    }

    function buildPuck(): void {
        puck = new createjs.Shape();
        puck.graphics.beginFill('#fff')
            .drawRect(0, 0, 10, 10);
        puck.width = 10
        puck.height = 10
        puck.x = canvas.width - 100
        puck.y = 160
        puck.velX = puck.velY = config.Game.PUCK_SPEED
        puck.isAlive = true
        //adds the puck to the botom layer of the stage 
        //this ensures that it travels under the scoreboard when it flies out of bounds 
        //beneath the floor
        stage.addChildAt(puck, 0)
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
                xPos = config.Game.WALL_THICKNESS
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
    function startGame(): void {
        createjs.Ticker.framerate = 60;
        createjs.Ticker.on('tick', (e) => {
            if (!e.paused) {
                runGame();
                stage.update();
            }
        })
    }
    function runGame() {
        //executes the update/render cycle
        update();
        render();

        //determines end level and/or end game scenarios
        evalPuck();
        evalGame();
    }

    //updating game elements in the game loop
    //the update cycle evaluates the next position of the puck and paddle, and 
    //how they will affect the game in regards to collision and bounds.
    function update() {
        updatePaddle();
        updatePuck();
        checkPaddle();
        checkBricks();
    }

    function updatePaddle() {
        var nextX = paddle.x;
        if (leftKeyDown) {
            nextX = paddle.x - config.Game.PADDLE_SPEED;
            if (nextX < leftWall) {
                nextX = leftWall;
            }
        }
        else if (rightKeyDown) {
            nextX = paddle.x + config.Game.PADDLE_SPEED;
            if (nextX > rightWall - paddle.width) {
                nextX = rightWall - paddle.width;
            }
        }
        paddle.nextX = nextX;
    }

    function updatePuck() {
        var nextX = puck.x + puck.velX;
        var nextY = puck.y + puck.velY;
        if (nextX < leftWall) {
            nextX = leftWall;
            puck.velX *= -1;
        }
        else if (nextX > (rightWall - puck.width)) {
            nextX = rightWall - puck.width;
            puck.velX *= -1;
        }
        if (nextY < (ceiling)) {
            nextY = ceiling;
            puck.velY *= -1;
        }
        puck.nextX = nextX;
        puck.nextY = nextY;
    }

    //checking for collisions
    function checkPaddle() {
        //checking if puck collided with the paddel
        //only need to check this if the puck is moving downwards, velY > 0
        if (puck.velY > 0 &&
            puck.isAlive &&
            puck.nextY > (paddle.y - paddle.height) &&
            puck.nextX >= paddle.x &&
            puck.nextX <= (paddle.x + paddle.width)) {
            puck.nextY = paddle.y - puck.height;

            //some var need to be reset if hit paddle
            //combo counts # consecutive brick hits before reaching paddle again
            combo = 0;
            paddleHits++;   //determines whether to add new level of bricks to the board
            puck.velY *= -1;
        }
    }

    //most complex function!
    function checkBricks() {
        if (!puck.isAlive) {
            return;
        }
        var i, brick;
        for (i = 0; i < bricks.length; i++) {
            brick = bricks[i];
            //handle collision and exit loop
            //only need to detect one brick collision per update cycle
            if (puck.nextY >= brick.y &&
                puck.nextY <= (brick.y + brick.height) &&
                puck.nextX >= brick.x &&
                puck.nextX <= (brick.x + brick.width)) {
                score += brick.points;
                combo++;
                if (brick.freeLife) {
                    lives++;
                    createjs.Tween.get(brick.freeLife)
                        .to({ alpha: 0, y: brick.freeLife.y - 100 }, 1000)
                        .call(function () {
                            stage.removeChild(this);
                        });
                }
                if (combo > 4) {
                    score += (combo * 10);
                    var comboTxt = new createjs.Text('COMBO X' + (combo * 10),
                        '14px Times', '#FF0000');
                    comboTxt.x = brick.x;
                    comboTxt.y = brick.y;
                    comboTxt.regX = brick.width / 2;
                    comboTxt.regY = brick.height / 2;
                    comboTxt.alpha = 0;
                    stage.addChild(comboTxt);
                    createjs.Tween.get(comboTxt)
                        .to({ alpha: 1, scaleX: 2, scaleY: 2, y: comboTxt.y - 60 }, 1000)
                        .call(function () {
                            stage.removeChild(this);
                        });
                }
                stage.removeChild(brick);
                bricks.splice(i, 1);
                puck.velY *= -1;
                break;
            }
        }
    }

    //Rendering the Game Elements
    function render() {
        paddle.x = paddle.nextX;
        puck.x = puck.nextX;
        puck.y = puck.nextY;
        livesTxt.text = "lives: " + lives;
        scoreTxt.text = "score: " + score;
    }

    //Evaluate scenarios - loss of a life, new level, end game
    function evalPuck() {
        if (puck.y > paddle.y) {
            puck.isAlive = false;
        }
        if (puck.y > canvas.height + 200) {
            puck.y = bricks[0].y + bricks[0].height + 40;
            puck.x = canvas.width / 2;
            puck.velX *= -1;
            puck.isAlive = true;
            combo = 0;
            lives--;
        }
    }
    function evalGame() {
        if (lives < 0 || bricks[0].y > board.y) {
            gameOver();
        }
        if (paddleHits == config.Game.PADDLE_HITS_FOR_NEW_LEVEL) {
            newLevel();
        }
    }

    //gameOver
    function gameOver() {
        createjs.Ticker.setPaused(true);
        gameRunning = false;
        messageTxt.text = "press spacebar to play";
        puck.visible = false;
        paddle.visible = false;
        stage.update();
        //causes the message to blink at the bottom
        messageInterval = setInterval(function () {
            messageTxt.visible = messageTxt.visible ? false : true;
            stage.update();
        }, 1000);
    }

    //reset game
    function resetGame() {
        clearInterval(messageInterval);
        level = 0;
        score = 0;
        lives = 5;
        paddleHits = 0;
        puck.y = 160;
        puck.velY = config.Game.PUCK_SPEED;
        puck.visible = true;
        paddle.visible = true;
        messageTxt.visible = true;
        gameRunning = true;
        messageTxt.text = "press spacebar to pause";
        stage.update();
        removeBricks();
        newLevel();
        newLevel();
        createjs.Ticker.setPaused(false);
    }
    function removeBricks() {
        var i, brick;
        for (i = 0; i < bricks.length; i++) {
            brick = bricks[i];
            if (brick.freeLife) {
                stage.removeChild(brick.freeLife);
            }
            stage.removeChild(brick);
        }
        bricks = [];
    }

    window.onload = init;
})();