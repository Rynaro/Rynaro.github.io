---
---

class KindBase {

  constructor(asset) {
    this._asset = asset;
  }

  scoreEffect() {
    return;
  }

  clockEffect() {
    return;
  }

  get asset() {
    return this._asset;
  }
}
