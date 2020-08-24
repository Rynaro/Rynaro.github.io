---
---

class IntroScene extends Phaser.Scene {

  constructor() {
    super("IntroScene");
    this.potionRows = [];
  }

  preload() {
    this.load.image('red_potion', 'assets/game/icons/32x32/potion_03a.png');
    this.load.image('blue_potion', 'assets/game/icons/32x32/potion_03b.png');
    this.load.image('green_potion', 'assets/game/icons/32x32/potion_03c.png');
    this.load.image('black_potion', 'assets/game/icons/32x32/potion_03d.png');
    this.load.image('purple_potion', 'assets/game/icons/32x32/potion_03e.png');
    this.load.image('orange_potion', 'assets/game/icons/32x32/potion_03f.png');
    this.load.image('pink_potion', 'assets/game/icons/32x32/potion_03g.png');
    this.load.image('white_potion', 'assets/game/icons/32x32/potion_03h.png');
  }

  create() {
    let { width, height } = this.sys.game.canvas;
    this.potionRows = this._generatePotions();
    // this.startButton = new StartButton(this, 87, height - 50, "PLAY !");
    // SOON youll be able to play a minigame here
  }

  update() {
    this._movePotionBelt();
  }

  _generatePotions() {
    let { width, height } = this.sys.game.canvas;
    let rows = Math.ceil(height / 48) - 3;
    let yPointer = 48;
    let actualRow = 0;
    let potionsRows = [];

    while(actualRow < rows) {
      potionsRows.push(this._drawLine(width, yPointer));
      yPointer += 48;
      actualRow += 1;
    }

    return potionsRows;
  }

  _drawLine(screenWidth, yPointer) {
    let xPointer = 32;
    let latestPotion;
    let potions = [];

    while (xPointer <= screenWidth) {
      latestPotion = this._safeRandomPotions(latestPotion);
      potions.push(this._generatePotion(xPointer, yPointer, `${latestPotion}_potion`));
      xPointer += 64;
    }

    return potions;
  }

  _generatePotion(x, y, color) {
    return new Potion(this, x, y, color);
  }

  _safeRandomPotions(previousColor) {
    let availableColorsLength = this._availableColors().length - 1;
    let gottenColor, index;
    do {
      index = Phaser.Math.RND.integerInRange(0, availableColorsLength);
      gottenColor = this._availableColors()[index];
    } while(previousColor === gottenColor);
    return gottenColor;
  }

  _availableColors() {
    return ['red', 'blue', 'green', 'black', 'purple', 'orange', 'white'];
  }

  _movePotionBelt() {
    this.potionRows.forEach((row, index) => {
      let direction = index % 2 === 0;
      this._translocatePotionsFrom(row, direction);
    });
  }

  _translocatePotionsFrom(row, direction) {
    let { width, _height } = this.sys.game.canvas;

    row.forEach(potion => {
      direction ? potion.moveLeft() : potion.moveRight();
      if(this._checkPotionOutBoundaries(potion.x, direction)) {
        potion.setX(direction ? width : 0);
      }
    });
  }

  _checkPotionOutBoundaries(potionPositionX, direction) {
    let { width, _height } = this.sys.game.canvas;
    return ((potionPositionX > width && !direction) || (potionPositionX < 0 && direction));
  }
}
