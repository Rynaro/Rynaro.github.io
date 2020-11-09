---
---

class CircularStuff extends CommonStuff {

  constructor(scene, targetY, targetX, kind) {
    super(scene, targetY, targetX, kind);
  }

  _defineMovementPattern() {
    let path =  new MovementPathGenerator(this.x, this.y).circularPattern();
    return path;
  }
}
