import { Item } from "./Item";

export class Worker{
    static idCurrent = 0;
    constructor(type, claimStamp, level, maxHealth, drain, state) {
      this.id = idCurrent+1;
      idCurrent++;
      this.type = type;
      this.claimStamp = claimStamp;
      this.level = level;
      this.maxHealth = maxHealth;
      this.drain = drain;
      this.status = [];
      this.state = state;
      this.options = {};
    }
    /**
     * Feeds the worker
     * @param {Item} item The item
     */
    feed(item){
      console.log(item.name);
    }
    
}

