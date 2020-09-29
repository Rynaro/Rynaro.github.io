---
---

class GameClock {
  constructor(scene) {
    this._scene = scene;
    this._ingameTime = 30;
    this._timeFrozen = false;
  }

  start() {
    this._scene.time.addEvent({
      delay : 1000,
      callback : () => { this._ingameClockEvent() },
      callbackScope : this.scene,
      loop: true
    });
  }

  _ingameClockEvent() {
    this._countDown();
  }

  _countDown() {
    if(!this._timeFrozen) {
      this._ingameTime--;
    }
  }

  isTimesUp() {
    return this._ingameTime < 0;
  }

  get ingameTime() {
    return this._ingameTime;
  }
}
