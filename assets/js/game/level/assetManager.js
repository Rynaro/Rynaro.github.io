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
        'greenPotion' : 'potion_03c.png',
        'redPotion' : 'potion_03a.png',
        'bluePotion' : 'potion_03b.png',
        'blackPotion' : 'potion_03d.png',
        'purplePotion' : 'potion_03e.png',
        'orangePotion' : 'potion_03f.png',
        'pinkPotion' : 'potion_03g.png',
        'whitePotion' : 'potion_03h.png'
      })
    );
  }

  get assetPath() {
    return 'assets/game/icons/32x32';
  }
}
