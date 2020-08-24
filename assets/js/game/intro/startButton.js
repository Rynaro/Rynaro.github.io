---
---

class StartButton extends Phaser.GameObjects.Text {

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
    alert("triggered")
  }
}
