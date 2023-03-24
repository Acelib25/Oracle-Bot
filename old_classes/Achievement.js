export class Achievement{
    /**
     * @param {string} name The name of the achievement
     * @param {number} timestamp The timestamp in Unix time of when the achievement was gotten
     */
    constructor(name, timestamp){
      this.name = name;
      this.timestamp = timestamp;
    }
  }