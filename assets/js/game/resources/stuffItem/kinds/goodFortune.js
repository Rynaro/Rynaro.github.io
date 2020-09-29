---
---

class GoodFortune extends KindBase {

  constructor(){
    super('pinkPotion');
  }

  scoreEffect() {
    return { 'operation' : 'increase', 'amount' : 3 };
  }
}
