/// <reference path="_reference.ts" />
(function () {
    var stage;
    function init() {
        console.log('app started');
        stage = new createjs.Stage(document.getElementById('canvas'));
        var el = new createjs.DOMElement(document.getElementById('instructions'));
        el.alpha = 0;
        el.regX = 200;
        el.x = stage.canvas.width / 2;
        el.y = 400;
        stage.addChild(el);
        createjs.Tween.get(el).wait(1000).to({ y: 40, alpha: 1 }, 2000, createjs.Ease.quadOut);
    }
    window.onload = init;
})();
//# sourceMappingURL=game.js.map