var config;
(function (config) {
    var Game = (function () {
        function Game() {
        }
        // Game constants
        Game.WALL_THICKNESS = 20;
        Game.PADDLE_WIDTH = 100;
        Game.PADDLE_SPEED = 16;
        Game.PUCK_SPEED = 5;
        Game.PADDLE_HITS_FOR_NEW_LEVEL = 5;
        Game.SCORE_BOARD_HEIGHT = 50;
        Game.ARROW_KEY_LEFT = 37;
        Game.ARROW_KEY_RIGHT = 39;
        Game.SPACE_KEY = 32;
        return Game;
    }());
    config.Game = Game;
})(config || (config = {}));
//# sourceMappingURL=config.js.map