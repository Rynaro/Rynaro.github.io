---
---

class StuffPopulation {
  constructor(scene) {
    this._scene = scene;
    this._limit = 13;
    this._currentPopulation = [];
  }

  watchPopulation() {
    this._destroyExpiredStuff();
    if (this._needsPopulate()) {
      this._currentPopulation.push(this._populate());
    }
  }

  _destroyExpiredStuff() {
    if(this._populationSize() === 0) return;

    let expiredStuff = this._currentPopulation.filter(stuff => { return stuff.expired });
    let remainingStuff = this._currentPopulation.filter(stuff => { return !stuff.expired });
    expiredStuff.forEach(stuff => { stuff.destroy() });
    this._reassurePopulation(remainingStuff);
  }

  _reassurePopulation(stuff) {
    this._currentPopulation = stuff;
  }

  _isStuffExpired(stuff) {
    return stuff.expired;
  }

  _populationSize() {
    return this._currentPopulation.length;
  }

  _needsPopulate() {
    return this._populationSize() < this._limit;
  }

  _populate() {
    let yPosition = Phaser.Math.RND.integerInRange(100, 800);
    let xPosition = Phaser.Math.RND.integerInRange(100, 800);
    return new StuffGenerator(this._scene, StrayStuff).generate(yPosition, xPosition, 'greenPotion');
  }
}
