---
---

class StuffSelectize {
  static generate() {
    return {
      'movement' : this._generateRandomAttributes(this._availableMovementBeings()),
      'kind' : this._generateRandomAttributes(this._availableBehaviourBeings())
    }
  }

  static _generateRandomAttributes(attributes) {
    return attributes[this._randomOf(attributes.length - 1)];
  }

  static _availableMovementBeings() {
    return [StrayStuff, StaticStuff, CircularStuff];
  }

  static _availableBehaviourBeings() {
    return [Poison, Health, Mana, GoodFortune, Empty];
  }

  static _randomOf(maximum) {
    return Phaser.Math.RND.integerInRange(0, maximum);
  }
}
