---
---

class CommonStuff extends Phaser.GameObjects.PathFollower {

  constructor(scene, targetX, targetY, kind) {
    super(scene, null, targetX, targetY, kind.asset);

    this._movementPattern = this._defineMovementPattern();
    this.setPath(this._movementPattern);

    this._lifespan = 7000; // in milliseconds
    this._pathFollowDuration = 9000; // in milliseconds
    this._kind = kind;

    this._expired = false;

    scene.physics.world.enable(this);
    scene.add.existing(this);

    this._activateEvents();
    this._activateCollision();
  }

  _activateEvents() {
    new LifespanEvent(this).activate();
    this.startMove();
  }

  _activateCollision() {
    new Collider(this.scene, this).effect();
  }

  expire() {
    this._expired = true;
  }

  startMove() {
    this.startFollow({
      duration: this._pathFollowDuration,
      repeat: -1,
      ease: 'Linear'
    });
  }

  _defineMovementPattern() {
    return; // signature method
  }

  get kind() {
    return this._kind;
  }

  get expired() {
    return this._expired;
  }

  get lifespan() {
    return this._lifespan;
  }
}
