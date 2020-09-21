---
---

class AssetLoader {
  constructor(screen) {
    this._screen = screen;
  }

  loadAll() {
    this.library.forEach((asset, key) => {
      this._screen.load.image(key, `${this.assetPath}/${asset}`);
    });
  }

  get library() {
    return new Map(
      Object.entries({
        'commonGlove' : 'gloves_01a.png',
        'greenPotion' : 'potion_03c.png'
      })
    );
  }

  get assetPath() {
    return 'assets/game/icons/32x32';
  }
}
