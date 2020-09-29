---
---

class Mana extends KindBase {

  constructor(){
    super('bluePotion');
  }

  scoreEffect() {
    return { 'operation' : 'increase', 'amount' : 2 };
  }
}
