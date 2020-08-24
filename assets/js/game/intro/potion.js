---
---

class Potion extends Phaser.GameObjects.Image {

  constructor(scene, xPosition, yPosition, color) {
    super(scene, xPosition, yPosition);

    this.setTexture(color);
    this.setPosition(xPosition, yPosition);

    this._properties();
    scene.children.add(this);
  }

  _properties() {
    this.movementSpeed = 0.7;
  }

  moveLeft() {
    this._horizontalMovement(this.movementSpeed * -1);
  }

  moveRight() {
    this._horizontalMovement(this.movementSpeed);
  }

  _horizontalMovement(x) {
    this.setX(this.x + x);
  }
}
