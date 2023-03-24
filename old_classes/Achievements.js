import { Achievement } from "./Achievement.js";

export class Achievements{
    constructor(){
      this.achievements = [];
    }
  
    //Achievement methods
  
    /**
     * Gets an Achievement by its name
     * @param {string} name The name of the achievement
     * @param {number} timestamp The timestamp in Unix time of when the achievement was gotten
     */
    get(name){
      const achievement = this.achievements.find(opt => opt.name === name);
      if (!achievement) {
        return null;
      }
      return achievement;
    }
  
    /**
     * Gets all Achievements
     */
    all(){
      return this.achievements;
    }
  
    /**
     * @param {string} name The name of the achievement
     * @param {number} timestamp The timestamp in Unix time of when the achievement was gotten
     */
    addAchievement(name, timestamp){
      this.achievements.push(new Achievement(name, timestamp))
    }
    deleteAchievement(){
  
    }
}
