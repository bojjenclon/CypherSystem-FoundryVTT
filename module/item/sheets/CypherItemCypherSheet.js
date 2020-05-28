import { ImprovedItemSheet } from './ImprovedItemSheet.js';

export class CypherItemCypherSheet extends ImprovedItemSheet {
    /**
     * Define default rendering options for the weapon sheet
     * @return {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 600,
            height: 500
        });
    }

    /* -------------------------------------------- */
    /*  Rendering                                   */
    /* -------------------------------------------- */

    /**
     * Get the correct HTML template path to use for rendering this particular sheet
     * @type {String}
     */
    get template() {
        return "systems/cyphersystem/templates/item/CypherSheet.html";
    }

    get type() {
        return "cypher";
    }

    getData() {
        const sheetData = super.getData();

        sheetData.isGM = game.user.isGM;

        return sheetData;
    }
}