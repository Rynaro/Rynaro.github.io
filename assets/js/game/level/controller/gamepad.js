---
---

class Gamepad {

  constructor(scene) {
    this._scene = scene;
    this._cursor = this._scene.input.keyboard.createCursorKeys();
  }

  watchPlayerControls() {
    this._verticalMovement();
    this._horizontalMovement();
    this._stoppingMovement();
  }

  _verticalMovement() {
    if(this._cursor.up.isDown) {
      this._scene.player.moveUp();
    } else if(this._cursor.down.isDown) {
      this._scene.player.moveDown();
    }
  }

  _horizontalMovement() {
    if(this._cursor.right.isDown) {
      this._scene.player.moveRight();
    } else if(this._cursor.left.isDown) {
      this._scene.player.moveLeft();
    }
  }

  _stoppingMovement() {
    if(this._cursor.up.isUp && this._cursor.down.isUp) {
      this._scene.player.stoppingVerticalMovement();
    }
    if(this._cursor.right.isUp && this._cursor.left.isUp) {
      this._scene.player.stoppingHorizontalMovement();
    }
  }
}
