---
---

class LevelScene extends Phaser.Scene {

  constructor() {
    super("LevelScene");
    this._player = {};
  }

  preload() {
    this.load.image('commonGlove', 'assets/game/icons/32x32/gloves_01a.png');
  }

  create() {
    this._player = new Player(this, 'commonGlove');
    this._controller = new Controller(this);
  }

  update() {
    this._controller.watchPlayerControls();
  }

  get player() {
    return this._player;
  }

  get screenWidth() {
    return this.sys.game.canvas.width;
  }

  get screenHeight(){
    return this.sys.game.canvas.height;
  }
}
