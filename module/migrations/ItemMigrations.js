import { Migrator } from "./Migrator.js";
import { CypherItem } from "../item/CypherItem.js";

//Keep migrators in order: v1 to v2, v2 to v3, etc.
const Itemv1ToV2Migrator = Object.create(Migrator);

Itemv1ToV2Migrator.forVersion = 2;
Itemv1ToV2Migrator.forObject = CypherItem;

/* Summary of changes:
  - Items may now have a "Quantity" field to indicate how many an actor currently has
*/
Itemv1ToV2Migrator.migrationFunction = async function(item, obj = {}) {
  const newData = Object.assign({ _id: item._id}, obj);

  const hasQuantity = [
    'weapon',
    'armor',
    'gear',
    'cypher',
    'artifact',
    'oddity'
  ];
  if (hasQuantity.indexOf(item.type) > -1) {
    if (!item.data.data.hasOwnProperty('quantity')) {
      // Default to 1 if not present
      newData["data.quantity"] = 1;
    }
  }

  newData["data.version"] = this.forVersion;

  return newData;
};

//Only export the latest migrator
export const ItemMigrator = Itemv1ToV2Migrator;
