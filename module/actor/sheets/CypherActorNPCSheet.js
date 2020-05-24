import { CYPHER_SYSTEM } from "../../Config.js";

/**
 * Extend the basic ActorSheet class to do all the Cypher System things!
 *
 * @type {ActorSheet}
 */
export class CypherActorNPCSheet extends ActorSheet {
  /**
   * Define default rendering options for the NPC sheet
   * @return {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 700,
      height: 550,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: "#npc-sheet-body",
          initial: "features"
        },
      ],
    });
  }

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    return "systems/cyphersystem/templates/NPCSheet.html";
  }

  setPosition(options) {
    // Restrict the window to a minimum size
    if (options && options.width && options.width < 700) {
      options.width = 700;
    }
    if (options && options.height && options.height < 295) {
      options.height = 295;
    }

    super.setPosition(options);
  }


  /**
   * @inheritdoc
   */
  getData() {
    const sheetData = super.getData();

    sheetData.ranges = CYPHER_SYSTEM.ranges;

    return sheetData;
  }

  activateListeners(html) {
    super.activateListeners(html);

    $('select[name="data.movement"]').select2({
      theme: 'numenera',
      width: '120px',
      minimumResultsForSearch: Infinity
    });
  }
}
