---
---

class Collider {

  constructor(scene, stuff) {
    this._scene = scene;
    this._stuff = stuff;
    this._player = this._scene.player;
  }

  effect() {
    this._scene.physics.add.collider(this._player, this._stuff, () => { console.log('collided'); });
  }
}
