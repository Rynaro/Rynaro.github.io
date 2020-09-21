---
---

class CommonStuff extends Phaser.GameObjects.Sprite {

  constructor(scene, targetY, targetX, asset) {
    super(scene, targetY, targetX, 'emptyBottle');

    this._asset = asset;
    this.setTexture(this._asset);


    this._lifespan = 7000; // in milliseconds
    this._expired = false;
    this._pointEvaluation = 1;
    this._movementSpeed = 250;

    scene.physics.world.enable(this);
    scene.add.existing(this);
    this._activateEvents();
    this._activateCollision();
  }

  _activateEvents() {
    new LifespanEvent(this).activate();
  }

  _activateCollision() {
    new Collider(this.scene, this).effect();
  }

  expire() {
    this._expired = true;
  }

  move() {
    this._movementPattern();
  }

  _verticalMovement(movementRule) {
    this.body.setVelocityY(movementRule);
  }

  _horizontalMovement(movementRule) {
    this.body.setVelocityX(movementRule);
  }

  _stoppingHorizontalMovement() {
    this._horizontalMovement(0);
  }

  _stoppingVerticalMovement() {
    this._verticalMovement(0);
  }

  _moveUp() {
    this._verticalMovement(this._movementSpeed * -1);
  }

  _moveDown() {
    this._verticalMovement(this._movementSpeed);
  }

  _moveRight() {
    this._horizontalMovement(this._movementSpeed);
  }

  _moveLeft() {
    this._horizontalMovement(this._movementSpeed * -1);
  }

  _movementPattern() {
    return;
  }

  get expired() {
    return this._expired;
  }

  get lifespan() {
    return this._lifespan;
  }

  set movementSpeed(value) {
    this._movementSpeed = value;
  }

  get movementSpeed() {
    return this._movementSpeed;
  }
}
