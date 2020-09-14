---
---

let game;

window.onload = function() {
  let gameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: "board",
    transparent: true,
    physics: { default: "arcade" },
    scene: [ IntroScene, LevelScene ]
  };

  game = new Phaser.Game(gameConfig);
}
