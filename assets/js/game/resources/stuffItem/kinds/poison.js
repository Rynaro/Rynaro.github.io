---
---

class Poison extends KindBase {

  constructor(){
    super('greenPotion');
  }

  scoreEffect() {
    return { 'operation' : 'decrease', 'amount' : 1 };
  }

  clockEffect() {
    return { 'operation' : 'heat', 'amount' : 2 };
  }
}
