---
---

class ClockText extends Phaser.GameObjects.Text {

  constructor(scene, x, y, clock) {
    super(scene, x, y, 'holder', {
      stroke: '#AAAAAA',
      strokeThickness: 2,
      color: '#FFFFFF',
      fontSize: '16px'
    });

    this._clock = clock;
    this.refresh();

    scene.children.add(this);
  }

  refresh() {
    this.setText(`CLOCK : ${this._clock.ingameTime}`);
    this._endingTimeStyle();
  }

  _endingTimeStyle() {
    if(this._clock.ingameTime === 10) {
      this.setColor('#E94F37');
    }
  }
}
