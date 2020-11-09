---
---

class MovementPathGenerator {
  constructor(x, y) {
    this._x = x;
    this._y = y;
    this._path = this._curvesPath();
  }

  circularPattern() {
    let width = Phaser.Math.RND.integerInRange(50, 95);
    this._path.add(new Phaser.Curves.Ellipse(this._x, this._y, width));
    return this._path;
  }

  strayPattern() {
    let curvePointsOccurrence = Phaser.Math.RND.integerInRange(3, 7);
    let destinationPoints = [];

    while(destinationPoints.length < curvePointsOccurrence) {
      destinationPoints.push(this._generateVector2());
    }

    destinationPoints.push(new Phaser.Math.Vector2(this.x, this.y))
    this._path.splineTo(destinationPoints);

    return this._path;
  }

  _generateVector2() {
    let newX = Phaser.Math.RND.integerInRange(this.x, this.x + 500);
    let newY = Phaser.Math.RND.integerInRange(this.y, this.y + 500);
    return new Phaser.Math.Vector2(newX, newY);
  }

  _curvesPath() {
    return new Phaser.Curves.Path(this.x, this.y);
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  set x(x) {
    return this._x = x;
  }

  set x(y) {
    return this._y = y;
  }
}
