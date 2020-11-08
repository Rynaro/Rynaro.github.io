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
    new GameOverText(this, this._calculatedXPosition(), this._calculatedYPosition());
    new FinalScoreText(this, this._calculatedXPosition(), this._adjustYPosition(50), this._score.points);
    new RestartButton(this, this._calculatedXPosition(), this._adjustYPosition(100), "REPLAY !");
    new ReturnMainScreenButton(this, this._calculatedXPosition(), this._adjustYPosition(140), "MAIN SCREEN !");
  }

  _adjustXPosition(acc) {
    return this._calculatedXPosition() + acc;
  }

  _adjustYPosition(acc) {
    return this._calculatedYPosition() + acc;
  }


  _calculatedXPosition() {
    return (this.screenWidth / 2) - 50;
  }

  _calculatedYPosition() {
    return (this.screenHeight / 2) - 150;
  }

  get screenWidth() {
    return this.sys.game.canvas.width;
  }

  get screenHeight(){
    return this.sys.game.canvas.height;
  }
}
