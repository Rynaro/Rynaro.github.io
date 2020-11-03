---
---

class FinalScoreText extends Phaser.GameObjects.Text {

  constructor(scene, x, y, score) {
    super(scene, x, y, 'holder', {
      stroke: '#AAAAAA',
      strokeThickness: 2,
      color: '#FFFFFF',
      fontSize: '16px'
    });

    this.setText(`SCORE: ${score}`);

    scene.children.add(this);
  }
}
