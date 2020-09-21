---
---

class Player extends Phaser.GameObjects.Sprite {

  constructor(scene, type) {
    super(scene, scene.screenWidth/2, scene.screenHeight/2, type);

    this._type = type;
    this._movementSpeed = 250;
    this.angle = 245;

    scene.physics.world.enable(this);
    scene.add.existing(this);
  }

  _verticalMovement(movementRule) {
    this.body.setVelocityY(movementRule);
  }

  _horizontalMovement(movementRule) {
    this.body.setVelocityX(movementRule);
  }

  stoppingHorizontalMovement() {
    this._horizontalMovement(0);
  }

  stoppingVerticalMovement() {
    this._verticalMovement(0);
  }

  moveUp() {
    this._verticalMovement(this._movementSpeed * -1);
  }

  moveDown() {
    this._verticalMovement(this._movementSpeed);
  }

  moveRight() {
    this._horizontalMovement(this._movementSpeed);
  }

  moveLeft() {
    this._horizontalMovement(this._movementSpeed * -1);
  }

  set movementSpeed(value) {
    this._movementSpeed = value;
  }

  get movementSpeed() {
    return this._movementSpeed;
  }

  set type(value) {
    this._type = value;
  }

  get type() {
    return this._type;
  }
}
