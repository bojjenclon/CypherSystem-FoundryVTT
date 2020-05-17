import { CYPHER_SYSTEM } from "../../config.js";
import { CypherItemAbility } from "../../item/CypherItemAbility.js";
import { CypherItemSkill } from "../../item/CypherItemSkill.js";
import { CypherItemWeapon } from "../../item/CypherItemWeapon.js";
import { CypherItemGear } from "../../item/CypherItemGear.js";

import { CypherRolls } from '../../roll.js';

import "../../../lib/dragula/dragula.js";

//Common Dragula options
const dragulaOptions = {
  moves: function (el, container, handle) {
    return handle.classList.contains('handle');
  }
};

//Sort function for order
const sortFunction = (a, b) => a.data.order < b.data.order ? -1 : a.data.order > b.data.order ? 1 : 0;

function onItemCreate(itemName, itemClass) {
  return function () {
    event.preventDefault();

    const itemData = {
      name: `New ${itemName.capitalize()}`,
      type: itemName,
      data: new itemClass({}),
    };

    return this.actor.createOwnedItem(itemData);
  }
}

function onItemEditGenerator(editClass) {
  return async function (event) {
    event.preventDefault();

    const elem = event.currentTarget.closest(editClass);
    const item = this.actor.getOwnedItem(elem.dataset.itemId);
    item.sheet.render(true);
  }
}

function onItemDeleteGenerator(deleteClass) {
  return function (event) {
    event.preventDefault();

    const elem = event.currentTarget.closest(deleteClass);
    const itemId = elem.dataset.itemId;
    this.actor.deleteOwnedItem(itemId);
  }
}

function onSkillUse(useClass) {
  return function (event) {
    event.preventDefault();

    const elem = event.currentTarget.closest(useClass);
    const itemId = elem.dataset.itemId;

    const { actor } = this;
    const item = actor.getOwnedItem(itemId);

    const { stat, name, inability, untrained, trained, specialized } = item.data.data;
    const statId = stat.toLowerCase();
    let assets;
    if (inability) {
      assets = -1;
    } else if (untrained) {
      assets = 0;
    } else if (trained) {
      assets = 1;
    } else if (specialized) {
      assets = 2;
    }

    CypherRolls.Roll({
      event,
      parts: ['1d20', `+${assets}`],
      data: {
        statId,
        abilityCost: 0,
        maxEffort: actor.data.data.effort,
        assets
      },
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${actor.name} used ${name}`,
      title: 'Use Skill',
      actor
    });
  }
}

function onAbilityUse(useClass) {
  return function (event) {
    event.preventDefault();

    const elem = event.currentTarget.closest(useClass);
    const itemId = elem.dataset.itemId;

    const { actor } = this;
    const item = actor.getOwnedItem(itemId);

    const { isAction, cost, name } = item.data.data;

    if (isAction) {
      const statId = cost.pool.toLowerCase();

      if (actor.canSpendFromPool(statId, parseInt(cost.amount, 10))) {
        CypherRolls.Roll({
          event,
          parts: ['1d20'],
          data: {
            statId,
            abilityCost: cost.amount,
            maxEffort: actor.data.data.effort
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
        }])
      }
    }
  }
}

/**
 * Extend the basic ActorSheet class to do all the Cypher System things!
 *
 * @type {ActorSheet}
 */
export class CypherActorPCSheet extends ActorSheet {
  /**
   * Define default rendering options for the NPC sheet
   * @return {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      scrollY: [
        "form.csr div.grid.weapons",
        "form.csr div.grid.skills",
        "form.csr div.grid.abilities",
        "form.csr ul.artifacts",
        "form.csr ul.cyphers",
        "form.csr ul.oddities",
      ],
      width: 900,
      height: 1000,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: "#pc-sheet-body",
          initial: "features"
        },
      ],
    });
  }

  static get advances() {
    return CYPHER_SYSTEM.advances;
  }

  constructor(...args) {
    super(...args);

    //Creation event handlers
    this.onAbilityCreate = onItemCreate("ability", CypherItemAbility);
    this.onSkillCreate = onItemCreate("skill", CypherItemSkill);
    this.onWeaponCreate = onItemCreate("weapon", CypherItemWeapon);
    this.onGearCreate = onItemCreate("gear", CypherItemGear);

    //Edit event handlers
    this.onAbilityEdit = onItemEditGenerator(".ability");
    this.onArtifactEdit = onItemEditGenerator(".artifact");
    this.onCypherEdit = onItemEditGenerator(".cypher");
    this.onSkillEdit = onItemEditGenerator(".skill");
    this.onWeaponEdit = onItemEditGenerator(".weapon");
    this.onGearEdit = onItemEditGenerator(".gear");

    //Use event handlers
    this.onSkillUse = onSkillUse(".skill");
    this.onAbilityUse = onAbilityUse(".ability");

    //Delete event handlers
    this.onAbilityDelete = onItemDeleteGenerator(".ability");
    this.onArtifactDelete = onItemDeleteGenerator(".artifact");
    this.onCypherDelete = onItemDeleteGenerator(".cypher");
    this.onOddityDelete = onItemDeleteGenerator(".oddity");
    this.onSkillDelete = onItemDeleteGenerator(".skill");
    this.onWeaponDelete = onItemDeleteGenerator(".weapon");
    this.onGearDelete = onItemDeleteGenerator(".gear");
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    return "systems/cypher-system/templates/characterSheet.html";
  }

  /**
   * Provides the data objects provided to the character sheet. Use that method
   * to insert new values or mess with existing ones.
   */
  getData() {
    const sheetData = super.getData();

    //Copy labels to be used as is
    sheetData.ranges = CYPHER_SYSTEM.ranges;
    sheetData.stats = CYPHER_SYSTEM.stats;
    sheetData.weaponTypes = CYPHER_SYSTEM.weaponTypes;
    sheetData.weights = CYPHER_SYSTEM.weightClasses;

    sheetData.advances = Object.entries(sheetData.actor.data.advances).map(
      ([key, value]) => {
        return {
          name: key,
          label: CYPHER_SYSTEM.advances[key],
          isChecked: value,
        };
      }
    );

    sheetData.damageTrackData = CYPHER_SYSTEM.damageTrack;
    sheetData.damageTrackDescription = CYPHER_SYSTEM.damageTrack[sheetData.data.damageTrack].description;

    sheetData.recoveriesData = Object.entries(
      sheetData.actor.data.recoveries
    ).map(([key, value]) => {
      return {
        key,
        label: CYPHER_SYSTEM.recoveries[key],
        checked: value,
      };
    });

    //Weapons section
    sheetData.data.items = sheetData.actor.items || {};

    const items = sheetData.data.items;
    if (!sheetData.data.items.abilities)
      sheetData.data.items.abilities = items.filter(i => i.type === "ability").sort(sortFunction);
    if (!sheetData.data.items.artifacts)
      sheetData.data.items.artifacts = items.filter(i => i.type === "artifact").sort(sortFunction);
    if (!sheetData.data.items.cyphers)
      sheetData.data.items.cyphers = items.filter(i => i.type === "cypher").sort(sortFunction);
    if (!sheetData.data.items.oddities)
      sheetData.data.items.oddities = items.filter(i => i.type === "oddity").sort(sortFunction);
    if (!sheetData.data.items.skills)
      sheetData.data.items.skills = items.filter(i => i.type === "skill").sort(sortFunction);
    if (!sheetData.data.items.weapons)
      sheetData.data.items.weapons = items.filter(i => i.type === "weapon").sort(sortFunction);
    if (!sheetData.data.items.gear)
      sheetData.data.items.gear = items.filter(i => i.type === "gear").sort(sortFunction);

    //Make it so that unidentified artifacts and cyphers appear as blank items
    //TODO extract this in the Item class if possible (perhaps as a static method?)
    sheetData.data.items.artifacts = sheetData.data.items.artifacts.map(artifact => {
      if (game.user.isGM) {
        artifact.editable = true;
      } else if (!artifact.data.identified) {
        artifact.name = "Unidentified Artifact";
        artifact.data.level = "Unknown";
        artifact.data.effect = "Unknown";
        artifact.data.depletion = null;
      }
      return artifact;
    });

    sheetData.data.items.cyphers = sheetData.data.items.cyphers.map(cypher => {
      if (game.user.isGM) {
        cypher.editable = true;
      } else if (!cypher.data.identified) {
        cypher.name = "Unidentified Cypher";
        cypher.data.level = "Unknown";
        cypher.data.effect = "Unknown";
      }
      return cypher;
    });

    sheetData.data.items.abilities = sheetData.data.items.abilities.map(ability => {
      ability.ranges = CYPHER_SYSTEM.optionalRanges;
      ability.stats = CYPHER_SYSTEM.stats;
      return ability;
    });

    sheetData.data.items.skills = sheetData.data.items.skills.map(skill => {
      skill.stats = CYPHER_SYSTEM.stats;
      return skill;
    });

    return sheetData;
  }

  /**
   * Add character sheet-specific event listeners.
   *
   * @param {*} html
   * @memberof CypherActorPCSheet
   */
  activateListeners(html) {
    super.activateListeners(html);

    const abilitiesTable = html.find("div.grid.abilities");
    abilitiesTable.on("click", ".ability-create", this.onAbilityCreate.bind(this));
    abilitiesTable.on("click", ".ability-info-btn", this.onAbilityEdit.bind(this));
    abilitiesTable.on("click", ".ability-use-btn", this.onAbilityUse.bind(this));
    abilitiesTable.on("click", ".ability-delete-btn", this.onAbilityDelete.bind(this));

    const skillsTable = html.find("div.grid.skills");
    skillsTable.on("click", ".skill-create", this.onSkillCreate.bind(this));
    skillsTable.on("click", ".skill-info-btn", this.onSkillEdit.bind(this));
    skillsTable.on("click", ".skill-use-btn", this.onSkillUse.bind(this));
    skillsTable.on("click", ".skill-delete", this.onSkillDelete.bind(this));

    const weaponsTable = html.find("div.grid.weapons");
    weaponsTable.on("click", ".weapon-create", this.onWeaponCreate.bind(this));
    weaponsTable.on("click", ".weapon-info-btn", this.onWeaponEdit.bind(this));
    weaponsTable.on("click", ".weapon-delete", this.onWeaponDelete.bind(this));

    const gearTable = html.find("div.grid.gear");
    gearTable.on("click", ".gear-create", this.onGearCreate.bind(this));
    gearTable.on("click", ".gear-info-btn", this.onGearEdit.bind(this));
    gearTable.on("click", ".gear-delete", this.onGearDelete.bind(this));

    html.find("ul.artifacts").on("click", ".artifact-delete", this.onArtifactDelete.bind(this));
    html.find("ul.cyphers").on("click", ".cypher-delete", this.onCypherDelete.bind(this));

    if (game.user.isGM) {
      html.find("ul.artifacts").on("blur", "input", this.onArtifactEdit.bind(this));
      html.find("ul.cyphers").on("blur", "input", this.onCypherEdit.bind(this));
    }

    html.find("ul.oddities").on("click", ".oddity-delete", this.onOddityDelete.bind(this));

    //Make sure to make a copy of the options object, otherwise only the first call
    //to Dragula seems to work
    const drakes = [];
    drakes.push(dragula([document.querySelector("div.grid.abilities > tbody")], Object.assign({}, dragulaOptions)));
    drakes.push(dragula([document.querySelector("div.grid.skills > tbody")], Object.assign({}, dragulaOptions)));
    drakes.push(dragula([document.querySelector("div.grid.weapons > .body")], Object.assign({}, dragulaOptions)));

    drakes.push(dragula([document.querySelector("ul.artifacts")], Object.assign({}, dragulaOptions)));
    drakes.push(dragula([document.querySelector("ul.cyphers")], Object.assign({}, dragulaOptions)));
    drakes.push(dragula([document.querySelector("ul.oddities")], Object.assign({}, dragulaOptions)));

    //Handle reordering on all these nice draggable elements
    //Assumes they all have a "order" property: should be the case since it's defined in the template.json
    drakes.map(drake => drake.on("drop", this.reorderElements.bind(this)));
  }

  async reorderElements(el, target, source, sibling) {
    const update = [];

    for (let i = 0; i < source.children.length; i++) {
      source.children[i].dataset.order = i;

      //In case we're dealing with plain objects, they won't have an ID
      if (source.children[i].dataset.itemId)
        update.push({ _id: source.children[i].dataset.itemId, "data.order": i });
    }

    //updateManyEmbeddedEntities is deprecated now and this function now accepts an array of data
    if (update.length > 0)
      await this.object.updateEmbeddedEntity("OwnedItem", update);
  }
}
