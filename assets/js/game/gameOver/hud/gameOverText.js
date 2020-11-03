---
---

class GameOverText extends Phaser.GameObjects.Text {

  constructor(scene, x, y) {
    super(scene, x, y, 'holder', {
      stroke: '#AAAAAA',
      strokeThickness: 2,
      color: '#FFFFFF',
      fontSize: '24px'
    });

    this.setText('Game Over!');

    scene.children.add(this);
  }
}
