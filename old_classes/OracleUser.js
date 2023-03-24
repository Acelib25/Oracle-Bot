const { Achievements } = require("./Achievements")
const { Items } = require("./Items")
const { Workers } = require("./Workers")
const { Effects } = require("./Effects")

export class OracleUser{
    constructor(id) {
      this.id = id;
      this.achievements = new Achievements();
      this.balance = 0;
      this.items = new Items();
      this.workers = new Workers();
      this.effects = new Effects();
    }    
}

