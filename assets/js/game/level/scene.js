---
---

class LevelScene extends Phaser.Scene {

  constructor() {
    super("LevelScene");
    this._assetManager = new AssetLoader(this);
  }

  preload() {
    this._assetManager.loadAll();
  }

  create() {
    this._score = new Score();
    this._clock = new GameClock(this);

    this._player = new Player(this, 'commonGlove');
    this._controller = new Gamepad(this);
    this._scoreText = new ScoreText(this, this.screenWidth - 200, 65, this._score);
    this._clockText = new ClockText(this, this.screenWidth - 200, 85, this._clock);

    this._stuffPopulationManager = new StuffPopulation(this);
    this._clock.start();
  }

  update() {
    this._gameIsOver();
    this._controller.watchPlayerControls();
    this._stuffPopulationManager.watchPopulation();
    this._scoreText.refresh();
    this._clockText.refresh();
  }

  _gameIsOver() {
    if (this._clock.isTimesUp()) this.scene.start('GameOverScene', { score: this._score });
  }

  get score() {
    return this._score;
  }

  get clock() {
    return this._clock;
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
