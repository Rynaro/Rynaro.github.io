---
---

class Health extends KindBase {

  constructor(){
    super('redPotion');
  }

  scoreEffect() {
    return { 'operation' : 'increase', 'amount' : 1 };
  }
}
