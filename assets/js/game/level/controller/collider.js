---
---

class Collider {

  constructor(scene, stuff) {
    this._scene = scene;
    this._stuff = stuff;
    this._player = this._scene.player;
  }

  effect() {
    this._scene.physics.add.collider(this._player, this._stuff, () => { this._triggerEvent(); });
  }

  _triggerEvent() {
    this._expireStuff();
    this._calculateScorePoint();
  }

  _expireStuff() {
    this._stuff.expire();
  }

  _calculateScorePoint() {
    return
  }
}
