---
---

class Controller {

  constructor(scene) {
    this._scene = scene;
    this._cursor = this._scene.input.keyboard.createCursorKeys();
  }

  watchPlayerControls() {
    if(this._cursor.up.isDown) {
      this._scene.player.moveUp();
    } else if(this._cursor.down.isDown) {
      this._scene.player.moveDown();
    } else if(this._cursor.right.isDown) {
      this._scene.player.moveRight();
    }  else if(this._cursor.left.isDown) {
      this._scene.player.moveLeft();
    } else {
      this._scene.player.stoppingMovement();
    }
  }

}
