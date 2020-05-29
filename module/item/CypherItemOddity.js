export class CypherItemOddity extends Item {
    get type() {
        return "oddity";
    }

    prepareData() {
        super.prepareData();

        const itemData = this.data.data;

        itemData.name = this.data.name || "New Oddity";
        itemData.quantity = itemData.quantity || 1;
        itemData.notes = itemData.notes || "";
    }
}