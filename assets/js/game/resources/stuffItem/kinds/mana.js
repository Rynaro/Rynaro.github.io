---
---

class Mana extends KindBase {

  constructor(){
    super('bluePotion');
  }

  scoreEffect() {
    return { 'operation' : 'increase', 'amount' : 1 };
  }

  clockEffect() {
    return { 'operation' : 'freeze', 'amount' : 3 };
  }
}
