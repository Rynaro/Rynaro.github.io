---
---

class StuffSelectize {

  generate() {
    return {
      'movement' : this._availableMovementBeings[this._randomOf(this._availableMovementBeings.length - 1)],
      'behaviour' : this._availableBehaviourBeings[this._randomOf(this._availableBehaviourBeings.length - 1)]
    }
  }

  _availableMovementBeings() {
    return [StrayStuff, StaticStuff, CircularStuff];
  }

  _availableBehaviourBeings() {
    return ['goodFortune', 'poisoned'];
  }

  _randomOf(maximum) {
    return Phaser.Math.RND.integerInRange(0, maximum);
  }
}
