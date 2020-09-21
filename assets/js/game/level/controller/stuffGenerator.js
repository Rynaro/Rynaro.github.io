---
---

class StuffGenerator {
  constructor(scene, stuffClass) {
    this._scene = scene;
    this._stuffClass = stuffClass;
  }

  generate(yPosition, xPosition, asset) {
    return new this._stuffClass(this._scene, yPosition, xPosition, asset);
  }
}
