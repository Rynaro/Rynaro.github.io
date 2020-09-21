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
    this._player = new Player(this, 'commonGlove');
    this._controller = new Gamepad(this);

    // this._stuff = new StrayStuff(this, 300, 300, 'greenPotion');
    // this.collider = new Collider(this, this._stuff);

    this._stuffPopulationManager = new StuffPopulation(this);
  }

  update() {
    this._controller.watchPlayerControls();
    this._stuffPopulationManager.watchPopulation();
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
