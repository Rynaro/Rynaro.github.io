---
---

class Empty extends KindBase {
  constructor(){
    super('whitePotion');
  }

  scoreEffect() {
    return { 'operation' : 'increase', 'amount' : 0 };
  }
}
