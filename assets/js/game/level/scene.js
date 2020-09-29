---
---

class LevelScene extends Phaser.Scene {

  constructor() {
    super("LevelScene");
    this._assetManager = new AssetLoader(this);
    this._score = new Score();
    this._clock = new GameClock(this);
  }

  preload() {
    this._assetManager.loadAll();
  }

  create() {
    this._player = new Player(this, 'commonGlove');
    this._controller = new Gamepad(this);
    this._scoreText = new ScoreText(this, this.screenWidth - 200, 65, this._score);
    this._clockText = new ClockText(this, this.screenWidth - 200, 85, this._clock);

    this._stuffPopulationManager = new StuffPopulation(this);
    this._clock.start();
  }

  update() {
    this._controller.watchPlayerControls();
    this._stuffPopulationManager.watchPopulation();
    this._scoreText.refresh();
    this._clockText.refresh();
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
