---
---

class StuffGenerator {
  constructor(scene) {
    this._scene = scene;
    this._stuff = StuffSelectize.generate();
  }

  generate() {
    let yPosition = Phaser.Math.RND.integerInRange(100, this._scene.screenHeight - 150);
    let xPosition = Phaser.Math.RND.integerInRange(100, this._scene.screenWidth - 150);

    return new this._stuff.movement(this._scene, xPosition, yPosition, this._initializedKind());
  }

  _initializedKind() {
    return new this._stuff.kind();
  }
}
