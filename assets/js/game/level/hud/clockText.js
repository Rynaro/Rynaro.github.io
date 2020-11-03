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
    this._stylizeText();
    this.setText(`TIME : ${this._composeText()}`);
  }

  _composeText() {
    let sentence = this._clock.ingameTime;
    if (this._clock.timesFrozen) sentence += ` + ${this._clock.frozenTime}`;

    return sentence;
  }

  _stylizeText() {
    this._clearStyle();
    this._frozenedTimeStyle();
    this._endingTimeStyle();
  }

  _clearStyle() {
    if(!this._clock.timesEnding && !this._clock.timesFrozen) {
      this.setColor('#FFFFFF');
    }
  }

  _endingTimeStyle() {
    if(this._clock.timesEnding && !this._clock.timesFrozen) {
      this.setColor('#E94F37');
    }
  }

  _frozenedTimeStyle() {
    if(this._clock.timesFrozen) {
      this.setColor('#3F88C5');
    }
  }
}
