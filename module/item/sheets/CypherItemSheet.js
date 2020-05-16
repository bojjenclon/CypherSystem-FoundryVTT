import { CypherItemAbilitySheet } from "./CypherItemAbilitySheet.js";
import { CypherItemArtifactSheet } from "./CypherItemArtifactSheet.js";
import { CypherItemArmorSheet } from "./CypherItemArmorSheet.js";
import { CypherItemCypherSheet } from "./CypherItemCypherSheet.js";
import { CypherItemEquipmentSheet } from "./CypherItemEquipmentSheet.js";
import { CypherItemOdditySheet } from "./CypherItemOdditySheet.js";
import { CypherItemWeaponSheet } from "./CypherItemWeaponSheet.js";

export class CypherItemSheet extends ItemSheet {
    constructor(data, options) {
        super(data, options);

        const { type } = data;
        if (!type)
            throw new Error('No item sheet type provided');

        //First, create an object of the appropriate type...
        let object = null;
        switch (type) {
            case "ability":
                object = new CypherItemAbilitySheet(data, options);
                break;
            case "armor":
                object = new CypherItemArmorSheet(data, options);
                break;
            case "artifact":
                object = new CypherItemArtifactSheet(data, options);
                break;
            case "cypher":
                object = new CypherItemCypherSheet(data, options);
                break;
            case "equipment":
                object = new CypherItemEquipmentSheet(data, options);
                break;
            case "oddity":
                object = new CypherItemOdditySheet(data, options);
                break;
            case "skill":
                object = new CypherItemSkillSheet(data, options);
                break;
            case "weapon":
                object = new CypherItemWeaponSheet(data, options);
                break;
        }

        if (object === null)
            throw new Error(`Unhandled object type ${type}`);

        //...then merge that object into the current one
        mergeObject(this, object);
    }
}