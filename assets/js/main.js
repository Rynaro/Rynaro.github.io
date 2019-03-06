var bubbles;

function initialize() {
  bubbles = new BubbleBuilder();
  bottle = new Bottle();
  loop();
}

function loop() {
  bubbles.update();

  requestAnimationFrame(loop);
}

initialize();
