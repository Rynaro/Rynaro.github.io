---
---

class LevelScene extends Phaser.Scene {

  constructor() {
    super("LevelScene");
    this._assetManager = new AssetLoader(this);
    this._score = new Score();
  }

  preload() {
    this._assetManager.loadAll();
  }

  create() {
    this._player = new Player(this, 'commonGlove');
    this._controller = new Gamepad(this);

    this._stuffPopulationManager = new StuffPopulation(this);
  }

  update() {
    this._controller.watchPlayerControls();
    this._stuffPopulationManager.watchPopulation();
    console.log(this._score.points);
  }

  get score() {
    return this._score;
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
