---
---

class LifespanEvent {

  constructor(stuff) {
    this._stuff = stuff;
    this._scene = this._stuff.scene;
  }

  activate() {
    this._scene.time.delayedCall(
      this._stuff.lifespan,
      () => { this._stuff.expire() },
      [],
      this._scene
    );
  }
}
