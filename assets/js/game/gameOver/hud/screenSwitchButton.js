---
---

class ScreenSwitchButton extends Phaser.GameObjects.Text {

  constructor(scene, x, y, text) {
    super(scene, x, y, text, {
      stroke: '#AAAAAA',
      strokeThickness: 2,
      color: '#FFFFFF',
      fontSize: '20px'
    });

    this.setInteractive({ useHandCursor: true })
    this.on('pointerdown', () => this._action());

    scene.children.add(this);
  }

  _action() {
    let levelScreen = this.scene.scene.get(this._targetScene());
    this.scene.scene.stop();
    levelScreen.scene.restart();
  }

  _targetScene() {
    return;
  }
}
