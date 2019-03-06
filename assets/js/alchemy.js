var gameBoard = document.getElementById('board');
var app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  antialias: true,
  transparent: true
});

gameBoard.appendChild(app.view);
