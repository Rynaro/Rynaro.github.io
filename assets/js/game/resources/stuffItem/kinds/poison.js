---
---

class Poison extends KindBase {

  constructor(){
    super('greenPotion');
  }

  scoreEffect() {
    return { 'operation' : 'decrease', 'amount' : 1 };
  }
}
