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
    let scoreEffect = this._stuff.kind.scoreEffect();

    if (scoreEffect.operation === 'increase') {
      this._scene.score.increasePoints(scoreEffect.amount);
    } else if(scoreEffect.operation === 'decrease') {
      this._scene.score.decreasePoints(scoreEffect.amount);
    }
  }
}
