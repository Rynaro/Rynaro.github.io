---
---

class CircularStuff extends CommonStuff {

  constructor(scene, targetY, targetX, asset) {
    super(scene, targetY, targetX, asset);
  }

  _defineMovementPattern() {
    let path =  new MovementPathGenerator(this.x, this.y).circularPattern();
    return path;
  }
}
