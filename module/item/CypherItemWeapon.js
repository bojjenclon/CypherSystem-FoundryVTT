import { CYPHER_SYSTEM } from '../config.js';

export class CypherItemWeapon extends Item {

    get type() {
        return "weapon";
    }

    prepareData() {
        super.prepareData();

        let itemData = this.data;
        if (itemData.hasOwnProperty("data"))
            itemData = itemData.data;

        //TODO we're duplicating the name here... why is that?
        const desc = Object.getOwnPropertyDescriptor(itemData, "name");
        if (desc && desc.writable)
            itemData.name = this.data.name || "New Weapon";

        itemData.damage = itemData.damage || 1;
        itemData.range = itemData.range || CYPHER_SYSTEM.ranges[0];
        itemData.weaponType = itemData.weaponType || CYPHER_SYSTEM.weaponTypes[0];
        itemData.weight = itemData.weight || CYPHER_SYSTEM.weightClasses[0];
        itemData.notes = itemData.notes || "";
        itemData.equipped = itemData.equipped || false;
        itemData.ranges = CYPHER_SYSTEM.ranges;

        itemData.weightClasses = CYPHER_SYSTEM.weightClasses.map(weightClass => {
            return {
                label: weightClass,
                checked: weightClass === itemData.weight,
            }
        });

        itemData.weaponTypes = CYPHER_SYSTEM.weaponTypes.map(weaponType => {
            return {
                label: weaponType,
                checked: weaponType === itemData.type,
            }
        });
    }
}