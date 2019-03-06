---
---

class Bubble extends PIXI.Graphics {
  constructor() {
    super();
    this.beginFill(0, 0);
    this.lineStyle(1.4, 0xF2D7EE);
    this.drawCircle(app.screen.width / 2, app.screen.height - 150, this._defineBodySize());
    this.speed = 0.02;
    this._definePersonality();

    app.stage.addChild(this);
  }

  move() {
    this._floatingUp();
    this._shaking();
  }

  outOfScreen() {
    let destroyZoneBound = (app.screen.height * -1) - 35;
    return this.y === destroyZoneBound;
  }

  _defineBodySize() {
    return this._generateRandomAttributeStatus(5, 9);
  }

  _definePersonality() {
    this.shakeBounds = this._generateRandomAttributeStatus(5, 30);
    this.shakeSpeed = this._generateRandomAttributeStatus(0.2, 0.6);
    this.gravityResistance = this._generateRandomAttributeStatus(1, 2.4);
  }

  _generateRandomAttributeStatus(minimumValue, maximumValue) {
    return Math.floor(Math.random() * maximumValue) + minimumValue;
  }

  _floatingUp() {
    this.y -= this.gravityResistance;
  }

  _shaking() {
    this._watchShakeMovement();
    if(this._hasReacheadShakeBoundaries()) {
      this._changeShakingDirection();
    }
    this.x += this.shakeSpeed;
  }

  _hasReacheadShakeBoundaries() {
  return this.x === this.shakeBounds || this.x === (this.shakeBounds * -1);
  }

  _watchShakeMovement() {
    let futureLocation = this.x + this.shakeSpeed;
    if(futureLocation > this.shakeBounds) {
      this.x = this.shakeBounds;
    } else if(futureLocation < (this.shakeBounds * -1)) {
      this.x = this.shakeBounds * -1;
    }
  }
  _changeShakingDirection() {
    this.shakeSpeed *= -1;
  }

}
