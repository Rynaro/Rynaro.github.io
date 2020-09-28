---
---

class StuffGenerator {
  constructor(scene, attributesSelected) {
    this._scene = scene;

    this._stuffClass = attributesSelected.movement;
    this._stuffKind = attributesSelected.kind;
  }

  generate(yPosition, xPosition) {
    return new this._stuffClass(this._scene, yPosition, xPosition, this._initializedKind());
  }

  _initializedKind() {
    return new this._stuffKind();
  }
}
