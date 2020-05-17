import { CypherItemAbility } from "./CypherItemAbility.js";
import { CypherItemArtifact } from "./CypherItemArtifact.js";
import { CypherItemArmor } from "./CypherItemArmor.js";
import { CypherItemCypher } from "./CypherItemCypher.js";
import { CypherItemGear } from "./CypherItemGear.js";
import { CypherItemOddity } from "./CypherItemOddity.js";
import { CypherItemSkill } from "./CypherItemSkill.js";
import { CypherItemWeapon } from "./CypherItemWeapon.js";

/**
 * Cypher System item base class
 *
 * Acts as a mix of factory and proxy: depending on its "type" argument,
 * creates an object of the right class (also extending Item) and simply
 * overrides its own properties with that of that new objects.
 *
 * This is used since Item doesn't really allow for real inheritance, so
 * we're simply faking it. #yolo #ididntchoosethethuglife
 *
 * @export
 * @class CypherItem
 * @extends {Item}
 */
export const CypherItem = new Proxy(function () {}, {
  //Calling a constructor from this proxy object
  construct: function (target, args) {
    const [data] = args;
    switch (data.type) {
      case "ability":
        return new CypherItemAbility(...args);
      case "armor":
        return new CypherItemArmor(...args);
      case "artifact":
        return new CypherItemArtifact(...args);
      case "cypher":
        return new CypherItemCypher(...args);
      case "gear":
        return new CypherItemGear(...args);
      case "oddity":
        return new CypherItemOddity(...args);
      case "skill":
        return new CypherItemSkill(...args);
      case "weapon":
        return new CypherItemWeapon(...args);
    }
  },
  //Property access on this weird, dirty proxy object
  get: function (target, prop, receiver) {
    switch (prop) {
      case "create":
        //Calling the class' create() static function
        return function (data, options) {
          switch (data.type) {
            case "ability":
              return CypherItemAbility.create(data, options);
            case "armor":
              return CypherItemArmor.create(data, options);
            case "artifact":
              return CypherItemArtifact.create(data, options);
            case "cypher":
              return CypherItemCypher.create(data, options);
            case "gear":
              return CypherItemGear.create(data, options);
            case "oddity":
              return CypherItemOddity.create(data, options);
            case "skill":
              return CypherItemSkill.create(data, options);
            case "weapon":
              return CypherItemWeapon.create(data, options);
          }
        };

      case Symbol.hasInstance:
        //Applying the "instanceof" operator on the instance object
        return function (instance) {
          return (
            instance instanceof CypherItemAbility ||
            instance instanceof CypherItemArmor ||
            instance instanceof CypherItemArtifact ||
            instance instanceof CypherItemCypher ||
            instance instanceof CypherItemGear ||
            instance instanceof CypherItemOddity ||
            instance instanceof CypherItemSkill ||
            instance instanceof CypherItemWeapon
          );
        };

      default:
        //Just forward any requested properties to the base Actor class
        return Item[prop];
    }
  },
});
