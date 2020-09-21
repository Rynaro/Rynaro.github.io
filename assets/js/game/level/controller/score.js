---
---

class Score {
  constructor() {
    this._score = 0;
  }

  increasePoints(value) {
    this._score += value;
  }

  reducePoints(value) {
    this._score -= value;
  }


  get score() {
    return this._score;
  }
}
