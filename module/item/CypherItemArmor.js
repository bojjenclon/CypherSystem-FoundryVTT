export class CypherItemArmor extends Item {
    get type() {
        return "armor";
    }

    prepareData() {
        super.prepareData();

        const itemData = this.data.data;

        itemData.name = this.data.name || "New Armor";
        itemData.armor = itemData.armor || 0;
        itemData.weight = itemData.weight || "Light";
        itemData.effect = itemData.price || 0;
        itemData.notes = itemData.notes || "";
        itemData.additionalSpeedEffortCost = itemData.additionalSpeedEffortCost || 0;
    }
}