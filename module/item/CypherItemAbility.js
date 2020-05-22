import { CypherRolls } from '../roll.js';

export class CypherItemAbility extends Item {
  get type() {
    return "ability";
  }

  prepareData() {
    super.prepareData();

    const { data } = this;
    const itemData = data.data || {};

    itemData.name = itemData.name || "New Ability";
    itemData.category = itemData.category || "";
    itemData.categoryValue = itemData.categoryValue || "";
    itemData.isAction = itemData.isAction || false;
    itemData.cost = itemData.cost || {};
    itemData.tier = itemData.tier || 1;
    itemData.range = itemData.range || "";
    itemData.stat = itemData.stat || "Might";
    itemData.notes = itemData.notes || "";

    data.data = itemData;
  }

  async roll() {
    const actor = this.actor;
    const actorData = actor.data.data;

    const item = this.data;
    const { isAction, cost, name } = item.data;

    if (isAction) {
      const statId = cost.pool.toLowerCase();

      if (actor.canSpendFromPool(statId, parseInt(cost.amount, 10))) {
        CypherRolls.Roll({
          event,
          parts: ['1d20'],
          data: {
            statId,
            abilityCost: cost.amount,
            maxEffort: actorData.effort
          },
          speaker: ChatMessage.getSpeaker({ actor }),
          flavor: `${actor.name} used ${name}`,
          title: 'Use Ability',
          actor
        });
      } else {
        const poolName = statId[0].toUpperCase() + statId.substr(1);
        ChatMessage.create([{
          speaker: ChatMessage.getSpeaker({ actor }),
          flavor: 'Ability Failed',
          content: `Not enough points in ${poolName} pool.`
        }]);
      }
    } else {
      ChatMessage.create([{
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: 'Invalid Ability',
        content: `This ability is an Enabler and cannot be rolled for.`
      }]);
    }
  }
}