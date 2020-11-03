---
---

class GameOverScene extends Phaser.Scene {

  constructor() {
    super("GameOverScene");
  }

  init(data) {
    this._score = data.score;
  }

  create() {
    new GameOverText(this, this._calculatedPositionWidth(), this._calculatedPositionHeight());
    new FinalScoreText(this, this._calculatedPositionWidth(), this._calculatedPositionHeight() + 50, this._score.points);
    new RestartButton(this, this._calculatedPositionWidth(), this._calculatedPositionHeight() + 100, "REPLAY !");
  }

  _calculatedPositionWidth() {
    return (this.screenWidth / 2) - 50;
  }

  _calculatedPositionHeight() {
    return (this.screenHeight / 2) - 150;
  }

  get screenWidth() {
    return this.sys.game.canvas.width;
  }

  get screenHeight(){
    return this.sys.game.canvas.height;
  }
}
