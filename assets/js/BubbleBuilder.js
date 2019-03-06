---
---

class BubbleBuilder {
  constructor() {
    this.bubbles = [];
    window.setInterval(() => {
      this.bubbles.push(new Bubble());
    }, 1000, this);
  }

  update() {
    this.bubbles.forEach((bubble, index, bubbles) => {
      bubble.move();

      if(bubble.outOfScreen()) {
        bubble.destroy();
        bubbles.splice(index, 1);
      }
    });
  }
}
