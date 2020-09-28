---
---

class Score {
  constructor() {
    this._points = 0;
  }

  increasePoints(value) {
    this._points += value;
  }

  decreasePoints(value) {
    this._points -= value;
  }

  get points() {
    return this._points;
  }
}
