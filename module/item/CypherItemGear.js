export class CypherItemGear extends Item {
    get type() {
        return "gear";
    }

    prepareData() {
        super.prepareData();

        const itemData = this.data.data;

        itemData.name = this.data.name || "New Gear";
        itemData.price = itemData.price || 0;
        itemData.notes = itemData.notes || "";
    }
}