---
---

class StrayStuff extends CommonStuff {

  constructor(scene, targetY, targetX, asset) {
    super(scene, targetY, targetX, asset);
  }

  movementPattern() {
    return;
  }

  get cardinalDirections() {
    return new Map(
      Object.entries({
        'up' : this._moveUp(),
        'down' : this._moveDown(),
        'right' : this._moveRight(),
        'left' : this._moveLeft()
      })
    );
  }
}
