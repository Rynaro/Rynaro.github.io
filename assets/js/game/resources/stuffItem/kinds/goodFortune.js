---
---

class GoodFortune extends KindBase {

  constructor(){
    super('pinkPotion');
  }

  scoreEffect() {
    return { 'operation' : 'increase', 'amount' : 3 };
  }

  clockEffect() {
    return { 'operation' : 'freeze', 'amount' : 1 };
  }
}
