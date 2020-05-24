import { CYPHER_SYSTEM } from "../../Config.js";
import { CypherItemAbility } from "../../item/CypherItemAbility.js";
import { CypherItemSkill } from "../../item/CypherItemSkill.js";
import { CypherItemWeapon } from "../../item/CypherItemWeapon.js";
import { CypherItemArmor } from "../../item/CypherItemArmor.js";
import { CypherItemGear } from "../../item/CypherItemGear.js";
import { CypherItemCypher } from "../../item/CypherItemCypher.js";
import { CypherItemArtifact } from "../../item/CypherItemArtifact.js";
import { CypherItemOddity } from "../../item/CypherItemOddity.js";

import { CypherRolls } from '../../Roll.js';

//Sort function for order
const sortFunction = (a, b) => a.data.order < b.data.order ? -1 : a.data.order > b.data.order ? 1 : 0;

const getProp = (obj, path) => {
  const fields = path.split('.');
  let inner = obj;
  fields.forEach(field => {
    inner = inner[field];
  });
  return inner;
};

function onSubMenuGenerator(sheetMenu) {
  return async function () {
    event.preventDefault();

    this.actor.update({
      'data.sheetMenu': sheetMenu
    });
  };
};

function onRollPoolGenerator() {
  return async function () {
    event.preventDefault();

    const { actor } = this;
    const actorData = actor.data.data;

    let srcElem = event.target;
    while (srcElem.tagName !== 'A') {
      srcElem = srcElem.parentElement;
    }

    const pool = srcElem.dataset.pool;
    const poolName = pool[0].toUpperCase() + pool.substr(1);
    
    CypherRolls.Roll({
      event,
      parts: ['1d20'],
      data: {
        statId: pool,
        maxEffort: actorData.effort,
      },
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${actor.name} used ${poolName}`,
      title: 'Use Pool',
      actor
    });
  }
}

function onRecoveryRollGenerator() {
  return async function () {
    event.preventDefault();

    const { actor } = this;
    const roll = new Roll(`1d6+${actor.data.data.recovery}`);
    roll.toMessage({
      title: 'Recovery Roll',
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${actor.name} used a recovery`
    });
  };
}

function onItemSortGenerator(sortField, itemType) {
  return async function () {
    event.preventDefault();

    let srcElem = event.target;
    while (srcElem.tagName !== 'A') {
      srcElem = srcElem.parentElement;
    }

    const { actor } = this;
    const itemField = srcElem.dataset.field;
    const itemProp = srcElem.dataset.prop;
    const items = actor.items.filter(item => item.data.type === itemType);
    const sortInfo = this.sorts[sortField];

    if (sortInfo.field === itemField) {
      sortInfo.asc = !sortInfo.asc;
    } else {
      sortInfo.field = itemField;
      sortInfo.asc = true;
    }

    items.sort((a, b) => {
      const aField = getProp(a, itemProp);
      const bField = getProp(b, itemProp);

      if (sortInfo.asc) {
        return aField < bField ? -1 : aField > bField ? 1 : 0;
      } else {
        return aField < bField ? 1 : aField > bField ? -1 : 0;
      }
    });

    const updates = [];
    items.forEach((item, idx) => {
      updates.push({
        _id: item._id,
        'data.order': idx
      });
    });

    await actor.updateEmbeddedEntity('OwnedItem', updates);
  }
}

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
    const { itemId } = elem.dataset;
    const item = this.actor.getOwnedItem(itemId);
    await item.sheet.render(true);
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

function onItemEquipGenerator(deleteClass) {
  return async function (event) {
    event.preventDefault();

    const elem = event.currentTarget.closest(deleteClass);
    const itemId = elem.dataset.itemId;
    const item = this.actor.getOwnedItem(itemId);
    const { data } = item.data;

    await item.update({
      "data.equipped": !data.equipped
    });
  }
}

function onItemUseGenerator(useClass) {
  return function (event) {
    event.preventDefault();

    const elem = event.currentTarget.closest(useClass);
    const itemId = elem.dataset.itemId;

    const { actor } = this;
    const item = actor.getOwnedItem(itemId);

    item.roll();
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
        "form.csr div.grid.armor",
        "form.csr div.grid.gear",
        "form.csr div.grid.skills",
        "form.csr div.grid.abilities",
        "form.csr div.grid.artifacts",
        "form.csr div.grid.cyphers",
        "form.csr div.grid.oddities",
      ],
      width: 900,
      height: 700,
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

    const sorts = this.sorts || {};
    const hasSortData = !!Object.keys(sorts).length;
    if (!hasSortData) {
      for (let key of CYPHER_SYSTEM.itemTypes) {
        sorts[key] = {
          'field': 'name',
          'asc': true
        };
      }
    }
    this.sorts = sorts;

    //Sub-menu event handlers
    this.onAdvancementSubMenu = onSubMenuGenerator('advancement');
    this.onDamageTrackSubMenu = onSubMenuGenerator('damage-track');
    this.onRecoverySubMenu = onSubMenuGenerator('recovery');

    this.onRollPool = onRollPoolGenerator();

    this.onRecoveryRoll = onRecoveryRollGenerator();

    //Sort event handlers
    this.onSkillSort = onItemSortGenerator('skills', 'skill');
    this.onAbilitySort = onItemSortGenerator('abilities', 'ability');
    this.onCypherSort = onItemSortGenerator('cyphers', 'cypher');
    this.onArtifactSort = onItemSortGenerator('artifacts', 'artifact');
    this.onOdditySort = onItemSortGenerator('oddities', 'oddity');
    this.onWeaponSort = onItemSortGenerator('weapons', 'weapon');
    this.onArmorSort = onItemSortGenerator('armor', 'armor');
    this.onGearSort = onItemSortGenerator('gear', 'gear');

    //Creation event handlers
    this.onSkillCreate = onItemCreate("skill", CypherItemSkill);
    this.onAbilityCreate = onItemCreate("ability", CypherItemAbility);
    this.onCypherCreate = onItemCreate("cypher", CypherItemCypher);
    this.onArtifactCreate = onItemCreate("artifact", CypherItemArtifact);
    this.onOddityCreate = onItemCreate("oddity", CypherItemOddity);
    this.onWeaponCreate = onItemCreate("weapon", CypherItemWeapon);
    this.onArmorCreate = onItemCreate("armor", CypherItemArmor);
    this.onGearCreate = onItemCreate("gear", CypherItemGear);

    //Edit event handlers
    this.onSkillEdit = onItemEditGenerator(".skill");
    this.onAbilityEdit = onItemEditGenerator(".ability");
    this.onCypherEdit = onItemEditGenerator(".cypher");
    this.onArtifactEdit = onItemEditGenerator(".artifact");
    this.onOddityEdit = onItemEditGenerator(".oddity");
    this.onWeaponEdit = onItemEditGenerator(".weapon");
    this.onArmorEdit = onItemEditGenerator(".armor");
    this.onGearEdit = onItemEditGenerator(".gear");

    //Use event handlers
    this.onSkillUse = onItemUseGenerator(".skill");
    this.onAbilityUse = onItemUseGenerator(".ability");

    //Delete event handlers
    this.onSkillDelete = onItemDeleteGenerator(".skill");
    this.onAbilityDelete = onItemDeleteGenerator(".ability");
    this.onCypherDelete = onItemDeleteGenerator(".cypher");
    this.onArtifactDelete = onItemDeleteGenerator(".artifact");
    this.onOddityDelete = onItemDeleteGenerator(".oddity");
    this.onWeaponDelete = onItemDeleteGenerator(".weapon");
    this.onArmorDelete = onItemDeleteGenerator(".armor");
    this.onGearDelete = onItemDeleteGenerator(".gear");

    //Equip event handler
    this.onWeaponEquip = onItemEquipGenerator('.weapon');
    this.onArmorEquip = onItemEquipGenerator('.armor');
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    return "systems/cyphersystem/templates/PCSheet.html";
  }

  setPosition(options) {
    // Restrict the window to a minimum size
    if (options && options.width && options.width < 900) {
      options.width = 900;
    }
    if (options && options.height && options.height < 460) {
      options.height = 460;
    }

    super.setPosition(options);
  }

  /**
   * Provides the data objects provided to the character sheet. Use that method
   * to insert new values or mess with existing ones.
   */
  getData() {
    const sheetData = super.getData();

    sheetData.isGM = game.user.isGM;

    //Copy labels to be used as is
    sheetData.ranges = CYPHER_SYSTEM.ranges;
    sheetData.stats = CYPHER_SYSTEM.stats;
    sheetData.weaponTypes = CYPHER_SYSTEM.weaponTypes;
    sheetData.weights = CYPHER_SYSTEM.weightClasses;

    sheetData.subMenu = sheetData.actor.data.sheetMenu;

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

    sheetData.data.items = sheetData.actor.items || {};
    sheetData.data.sorts = this.sorts || {};

    const items = sheetData.data.items;
    if (!sheetData.data.items.abilities) {
      sheetData.data.items.abilities = items.filter(i => i.type === "ability").sort(sortFunction);
    }
    if (!sheetData.data.items.artifacts) {
      sheetData.data.items.artifacts = items.filter(i => i.type === "artifact").sort(sortFunction);
    }
    if (!sheetData.data.items.cyphers) {
      sheetData.data.items.cyphers = items.filter(i => i.type === "cypher").sort(sortFunction);
    }
    if (!sheetData.data.items.oddities) {
      sheetData.data.items.oddities = items.filter(i => i.type === "oddity").sort(sortFunction);
    }
    if (!sheetData.data.items.skills) {
      sheetData.data.items.skills = items.filter(i => i.type === "skill").sort(sortFunction);
    }
    if (!sheetData.data.items.weapons) {
      sheetData.data.items.weapons = items.filter(i => i.type === "weapon").sort(sortFunction);
    }
    if (!sheetData.data.items.armor) {
      sheetData.data.items.armor = items.filter(i => i.type === "armor").sort(sortFunction);
    }
    if (!sheetData.data.items.gear) {
      sheetData.data.items.gear = items.filter(i => i.type === "gear").sort(sortFunction);
    }

    sheetData.displayCypherLimitWarning = this.actor.isOverCypherLimit();

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

    // Setup select elements
    $('select[name="data.damageTrack"]').select2({
      theme: 'numenera',
      width: '120px',
      minimumResultsForSearch: Infinity
    });

    const headerSubMenu = html.find('div.sub-menu .selector');
    headerSubMenu.on("click", ".damage-track", this.onDamageTrackSubMenu.bind(this));
    headerSubMenu.on("click", ".advancement", this.onAdvancementSubMenu.bind(this));
    headerSubMenu.on("click", ".recovery", this.onRecoverySubMenu.bind(this));

    const headerPrimaryData = html.find('div.header .primary-data');
    headerPrimaryData.on("click", ".roll-pool", this.onRollPool.bind(this));

    const headerRecovery = html.find('div.sub-menu .panels .recovery');
    headerRecovery.on('click', '.recovery-roll', this.onRecoveryRoll.bind(this));

    const skillsTable = html.find("div.grid.skills");
    skillsTable.on("click", ".sort-header", this.onSkillSort.bind(this));
    skillsTable.on("click", ".skill-create", this.onSkillCreate.bind(this));
    skillsTable.on("click", ".skill-info-btn", this.onSkillEdit.bind(this));
    skillsTable.on("click", ".skill-use-btn", this.onSkillUse.bind(this));
    skillsTable.on("click", ".skill-delete", this.onSkillDelete.bind(this));

    const abilitiesTable = html.find("div.grid.abilities");
    abilitiesTable.on('click', '.sort-header', this.onAbilitySort.bind(this));
    abilitiesTable.on("click", ".ability-create", this.onAbilityCreate.bind(this));
    abilitiesTable.on("click", ".ability-info-btn", this.onAbilityEdit.bind(this));
    abilitiesTable.on("click", ".ability-use-btn", this.onAbilityUse.bind(this));
    abilitiesTable.on("click", ".ability-delete-btn", this.onAbilityDelete.bind(this));
    
    const cypherTable = html.find("div.grid.cyphers");
    cypherTable.on("click", ".sort-header", this.onCypherSort.bind(this));
    cypherTable.on("click", ".cypher-create", this.onCypherCreate.bind(this));
    cypherTable.on("click", ".cypher-info-btn", this.onCypherEdit.bind(this));
    cypherTable.on("click", ".cypher-delete", this.onCypherDelete.bind(this));

    const artifactsTable = html.find("div.grid.artifacts");
    artifactsTable.on("click", ".sort-header", this.onArtifactSort.bind(this));
    artifactsTable.on("click", ".artifact-create", this.onArtifactCreate.bind(this));
    artifactsTable.on("click", ".artifact-info-btn", this.onArtifactEdit.bind(this));
    artifactsTable.on("click", ".artifact-delete", this.onArtifactDelete.bind(this));

    const odditiesTable = html.find("div.grid.oddities");
    odditiesTable.on("click", ".sort-header", this.onOdditySort.bind(this));
    odditiesTable.on("click", ".oddity-create", this.onOddityCreate.bind(this));
    odditiesTable.on("click", ".oddity-info-btn", this.onOddityEdit.bind(this));
    odditiesTable.on("click", ".oddity-delete", this.onOddityDelete.bind(this));

    const weaponsTable = html.find("div.grid.weapons");
    weaponsTable.on("click", ".sort-header", this.onWeaponSort.bind(this));
    weaponsTable.on("click", ".weapon-create", this.onWeaponCreate.bind(this));
    weaponsTable.on("click", ".weapon-info-btn", this.onWeaponEdit.bind(this));
    weaponsTable.on("click", ".weapon-delete", this.onWeaponDelete.bind(this));
    weaponsTable.on("click", ".weapon-equip-btn", this.onWeaponEquip.bind(this));

    const armorTable = html.find("div.grid.armor");
    armorTable.on("click", ".sort-header", this.onArmorSort.bind(this));
    armorTable.on("click", ".armor-create", this.onArmorCreate.bind(this));
    armorTable.on("click", ".armor-info-btn", this.onArmorEdit.bind(this));
    armorTable.on("click", ".armor-delete", this.onArmorDelete.bind(this));
    armorTable.on("click", ".armor-equip-btn", this.onArmorEquip.bind(this));

    const gearTable = html.find("div.grid.gear");
    gearTable.on("click", ".sort-header", this.onGearSort.bind(this));
    gearTable.on("click", ".gear-create", this.onGearCreate.bind(this));
    gearTable.on("click", ".gear-info-btn", this.onGearEdit.bind(this));
    gearTable.on("click", ".gear-delete", this.onGearDelete.bind(this));

    if (this.actor.owner) {
      const handler = ev => this._onDragItemStart(ev);

      // Find all skills on the character sheet.
      html.find('.grid .skill').each((i, skill) => {
        // Add draggable attribute and dragstart listener.
        skill.setAttribute("draggable", true);
        skill.addEventListener("dragstart", handler, false);
      });

      // Find all abilities on the character sheet.
      html.find('.grid .ability').each((i, ability) => {
        // Add draggable attribute and dragstart listener.
        ability.setAttribute("draggable", true);
        ability.addEventListener("dragstart", handler, false);
      });
    }
  }
}
