import { Migrator } from "./Migrator.js";

//Keep migrators in order: v1 to v2, v2 to v3, etc.
const PCActorv1ToV2Migrator = Object.create(Migrator);

PCActorv1ToV2Migrator.forVersion = 2;
PCActorv1ToV2Migrator.forType = "pc";

/* Summary of changes:
* - Rename "shins" to "money"
*/
PCActorv1ToV2Migrator.migrationFunction = async function(actor, obj = {}) {
  const newData = Object.assign({ _id: actor._id}, obj);

  if (actor.data.data.shins) {
    newData['data.money'] = actor.data.data.shins;
    newData['data.-=shins'] = null;
  } else {
    newData['data.money'] = 0;
  }

  newData["data.version"] = this.forVersion;

  return newData;
}

//Only export the latest migrator
export const PCActorMigrator = PCActorv1ToV2Migrator;
