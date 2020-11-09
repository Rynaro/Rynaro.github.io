---
---

// I choosed manage the game clocking
class GameClock {
  constructor(scene) {
    this._scene = scene;
    this._ingameTime = 30;
    this._frozenTime = 0;
  }

  start() {
    this._scene.time.addEvent({
      delay : 1000,
      callback : () => { this._ingameClockEvent() },
      callbackScope : this._scene,
      loop: true
    });
  }

  isTimesUp() {
    return this._ingameTime <= 0;
  }

  freezeFor(time) {
    this._frozenTime += time;
    this._frozenTime = this._frozenTime > 5 ? 5 : this._frozenTime;
  }

  heatFor(time) {
    this._frozenTime -= time;
    this._frozenTime = this._frozenTime < 0 ? 0 : this._frozenTime;
  }

  _ingameClockEvent() {
    this._countDown();
  }

  _countDown() {
    this.timesFrozen ? this._frozenTime-- : this._ingameTime--;
  }

  get frozenTime() {
    return this._frozenTime;
  }

  get timesFrozen() {
    return this._frozenTime > 0;
  }

  get timesEnding() {
    return this.ingameTime <= 10;
  }

  get ingameTime() {
    return this._ingameTime;
  }
}
