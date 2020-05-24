import { CypherRolls } from '../Roll.js';

export class CypherItemSkill extends Item {
  get type() {
    return "gear";
  }

  prepareData() {
    super.prepareData();

    const itemData = this.data.data || {};

    itemData.name = this.data ? this.data.name : "New Skill";
    itemData.notes = itemData.notes || "";
    itemData.stat = itemData.stat || "";
    itemData.inability = itemData.inability || false;
    itemData.trained = itemData.trained || false;
    itemData.specialized = itemData.specialized || false;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const actor = this.actor;
    const actorData = actor.data.data;

    const item = this.data;
    const { stat, name, inability, untrained, trained, specialized } = item.data;
    const statId = stat.toLowerCase();
    let assets;
    if (inability) {
      assets = -1;
    } else if (untrained) {
      assets = 0;
    } else if (trained) {
      assets = 1;
    } else if (specialized) {
      assets = 2;
    }

    
    const parts = ['1d20'];
    if (assets !== 0) {
      const sign = assets < 0 ? '-' : '+';
      parts.push(`${sign} ${Math.abs(assets) * 3}`);
    }

    CypherRolls.Roll({
      event,
      parts,
      data: {
        statId,
        abilityCost: 0,
        maxEffort: actorData.effort,
        assets
      },
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${actor.name} used ${name}`,
      title: 'Use Skill',
      actor
    });
  }
}