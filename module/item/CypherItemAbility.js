export class CypherItemAbility extends Item {
  get type() {
    return "ability";
  }

  prepareData() {
    super.prepareData();

    const { data } = this;
    const itemData = data.data || {};

    const stat = itemData.stat || "Might";

    itemData.name = itemData.name || "New Ability";
    itemData.category = itemData.category || "";
    itemData.categoryValue = itemData.categoryValue || "";
    itemData.isAction = itemData.isAction || false;
    itemData.cost = itemData.cost || {
      amount: 0,
      pool: stat
    };
    itemData.tier = itemData.tier || 1;
    itemData.range = itemData.range || "";
    itemData.stat = stat;
    itemData.notes = itemData.notes || "";

    data.data = itemData;
  }
}