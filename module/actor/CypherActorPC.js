import { CYPHER_SYSTEM } from '../Config.js';
import { PlayerChoiceDialog } from '../dialogs/PlayerChoiceDialog.js';

const effortObject = {
  cost: 0,
  effortLevel: 0,
  warning: null,
};

/**
 * Extend the base Actor class to implement additional logic specialized for the Cypher System.
 */
export class CypherActorPC extends Actor {

  getInitiativeFormula() {
    //Check for an initiative skill
    const initSkill = 3 * this.getSkillLevel("Initiative");

    //TODO possible assets, effort on init roll
    let formula = "1d20"
    if (initSkill !== 0) {
      formula += `+${initSkill}`;
    }

    return formula;
  }

  get effort() {
    const data = this.data.data;

    return data.tier + (data.advances.effort ? 1 : 0);
  }

  get canRefuseIntrusion() {
    const { data } = this.data;

    return data.xp > 0;
  }

  /**
   * Get the current PC's level on the damage track as an integer, 0 being Hale and 3 being Dead.
   * @type {Object} stats Stats object (see template.json)
   */
  damageTrackLevel(stats = null) {
    if (stats === null)
      stats = this.data.data.stats;

    //Each stat pool whose value is 0 counts as being one step higher on the damage track
    return Object.values(stats).filter(stat => {
      return stat.pool.current === 0;
    }).length;
  }

  /**
   * Given a skill ID, return this skill's level as a a numeric value.
   *
   * @param {string} skillId
   * @returns {Number}
   * @memberof CypherActorPC
   */
  getSkillLevel(skillId) {
    if (!skill)
      throw new Error("No skill provided");

    if (!skill.data.data)
      return 0; //skills are untrained by default

    skill = skill.data.data;
    let level = -Number(skill.inability); //Inability subtracts 1 from overall level

    if (skill.specialized) level += 2;
    else if (skill.trained) level += 1;

    return level;
  }

  /**
   * Add a new skill to the PC actor.
   *
   * @param {string} name Name of the skill
   * @param {string} stat Stat used for that skill (Might, Speed or Intellect)
   * @param {number} [level=1] Skill level (0 = untrained, 1 = trained, 2 = specialized)
   * @param {boolean} [inability=false] Inability
   * @returns The new skill object
   * @memberof CypherActorPC
   */
  addSkill(name, stat, level = 1, inability = false) {
    if (this.getSkillLevel(name)) {
      throw new Error("This PC already has the skill " + name);
    }

    const id = name.replace(" ", ""); //id will be the skill name, without whitespace
    const skill = {
      id,
      name,
      stat,
      level,
      inability,
    };

    this.data.data.skills[id] = skill;
    return skill;
  }

  /**
   * Delete a skill from a PC actor's list.
   *
   * @param {string} skillId String ID of the skill to delete
   * @returns The remaining skills
   * @memberof CypherActorPC
   */
  deleteSkill(skillId) {
    if (!this.data.data.skills.hasOwnProperty(skillId)) {
      throw new Error("This PC does not have that skill");
    }

    delete this.data.data.skills[skillId];
    return this.data.data.skills;
  }

  /**
   * Given a stat ID, return all skills related to that stat.
   *
   * @param {string} statId
   * @returns {Array}
   * @memberof CypherActorPC
   */
  filterSkillsByStat(statId) {
    if (!statId) {
      return this.skills;
    }

    return this.data.data.skills.filter(id => id == statId);
  }

  getEffortCostFromStat(statId, effortLevel) {
    //Return value, copy from template object
    const value = { ...effortObject };

    if (effortLevel === 0) {
      return value;
    }

    const actorData = this.data.data;
    const stat = actorData.stats[statId];

    //The first effort level costs 3 pts from the pool, extra levels cost 2
    //Substract the related Edge, too
    const availableEffortFromPool = (stat.pool.current + stat.edge - 1) / 2;

    //A PC can use as much as their Effort score, but not more
    //They're also limited by their current pool value
    const finalEffort = Math.min(effortLevel, actorData.effort, availableEffortFromPool);
    const cost = 1 + 2 * finalEffort - stat.edge;

    //TODO take free levels of Effort into account here

    let warning = null;
    if (effortLevel > availableEffortFromPool) {
      warning = `Not enough points in your ${statId} pool for that level of Effort`;
    }

    value.cost = cost;
    value.effortLevel = finalEffort;
    value.warning = warning;

    return value;
  }

  canSpendFromPool(statId, amount) {
    const actorData = this.data.data;
    const stat = actorData.stats[statId];

    return amount <= stat.pool.current;
  }

  spendFromPool(statId, amount) {
    if (!this.canSpendFromPool(statId, amount)) {
      return false;
    }

    const actorData = this.data.data;
    const stat = actorData.stats[statId];

    const data = {};
    data[`data.stats.${statId}.pool.current`] = Math.max(0, stat.pool.current - amount);
    this.update(data);

    return true;
  }

  getTotalArmor() {
    return this.getEmbeddedCollection("OwnedItem").filter(i => i.type === "armor")
      .reduce((acc, armor) => acc + Number(armor.data.armor), 0);
  }

  isOverCypherLimit() {
    const cyphers = this.getEmbeddedCollection("OwnedItem").filter(i => i.type === "cypher");

    return this.data.data.cypherLimit < cyphers.length;
  }

  async onGMIntrusion(accepted) {
    let xp = this.data.data.xp;
    let choiceVerb;

    if (accepted) {
      xp++;
      choiceVerb = "accepts";
    } else {
      xp--;
      choiceVerb = "refuses";
    }

    this.update({
      _id: this._id,
      "data.xp": xp,
    });

    ChatMessage.create({
      content: `<h2>GM Intrusion</h2><br/>${this.data.name} ${choiceVerb} the intrusion`,
    });

    if (accepted) {
      const otherActors = game.actors.filter(actor => actor._id !== this._id && actor.data.type === 'pc');

      const dialog = new PlayerChoiceDialog(otherActors, (chosenActorId) => {
        game.socket.emit('system.cyphersystem', {
          type: 'awardXP',
          data: {
            actorId: chosenActorId,
            xpAmount: 1
          }
        })
      });
      dialog.render(true);
    }
  }

  /**
   * BASE CLASS OVERRIDES
   */

  /**
   * @override
   */
  async createEmbeddedEntity(...args) {
    const [_, data] = args;

    //Prepare cypher items by rolling their level, if they don't have one already
    if (data.data && ['artifact', 'cypher'].indexOf(data.type) !== -1) {
      const itemData = data.data;

      if (!itemData.level && itemData.levelDie) {
        try {
          //Try the formula as is first
          itemData.level = new Roll(itemData.levelDie).roll().total;
          await this.update({
            _id: this._id,
            "data.level": itemData.level,
          });
        }
        catch (Error) {
          try {
            itemData.level = parseInt(itemData.level)
          }
          catch (Error) {
            //Leave it as it is
          }
        }
      } else {
        itemData.level = itemData.level || null;
      }
    }

    return super.createEmbeddedEntity(...args);
  }
}
