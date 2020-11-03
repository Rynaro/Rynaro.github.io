---
---

class IntroScene extends Phaser.Scene {

  constructor() {
    super("IntroScene");
    this.potionRows = [];
  }

  preload() {
    this.load.image('redPotion', 'assets/game/icons/32x32/potion_03a.png');
    this.load.image('bluePotion', 'assets/game/icons/32x32/potion_03b.png');
    this.load.image('greenPotion', 'assets/game/icons/32x32/potion_03c.png');
    this.load.image('blackPotion', 'assets/game/icons/32x32/potion_03d.png');
    this.load.image('purplePotion', 'assets/game/icons/32x32/potion_03e.png');
    this.load.image('orangePotion', 'assets/game/icons/32x32/potion_03f.png');
    this.load.image('pinkPotion', 'assets/game/icons/32x32/potion_03g.png');
    this.load.image('whitePotion', 'assets/game/icons/32x32/potion_03h.png');
  }

  create() {
    this.potionRows = this._generatePotions();
    this.startButton = new StartButton(this, 87, this.screenHeight - 50, "PLAY !");
  }

  update() {
    this._movePotionBelt();
  }

  _generatePotions() {
    let rows = Math.ceil(this.screenHeight / 48) - 3;
    let yPointer = 48;
    let actualRow = 0;
    let potionsRows = [];

    while(actualRow < rows) {
      potionsRows.push(this._drawLine(this.screenWidth, yPointer));
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
      potions.push(this._generatePotion(xPointer, yPointer, `${latestPotion}Potion`));
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

    row.forEach(potion => {
      direction ? potion.moveLeft() : potion.moveRight();
      if(this._checkPotionOutBoundaries(potion.x, direction)) {
        potion.setX(direction ? this.screenWidth : 0);
      }
    });
  }

  _checkPotionOutBoundaries(potionPositionX, direction) {
    return ((potionPositionX > this.screenWidth && !direction) || (potionPositionX < 0 && direction));
  }

  get screenWidth() {
    return this.sys.game.canvas.width;
  }

  get screenHeight(){
    return this.sys.game.canvas.height;
  }
}
