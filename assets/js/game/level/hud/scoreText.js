---
---

class ScoreText extends Phaser.GameObjects.Text {

  constructor(scene, x, y, score) {
    super(scene, x, y, 'holder', {
      stroke: '#AAAAAA',
      strokeThickness: 2,
      color: '#FFFFFF',
      fontSize: '16px'
    });

    this._score = score;
    this.refresh();

    scene.children.add(this);
  }

  refresh() {
    this.setText(`SCORE : ${this._score.points}`);
  }
}
