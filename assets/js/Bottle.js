---
---

class Bottle {
  constructor() {
    this.scale_size = 90;
    this.sprite = PIXI.Sprite.fromImage("assets/images/bottle.png");
    this.sprite.x = (app.screen.width / 2) - (this.scale_size / 2);
    this.sprite.y = app.screen.height - 125;
    this.sprite.width = this.scale_size;
    this.sprite.height = this.scale_size;

    app.stage.addChild(this.sprite);
  }
}
