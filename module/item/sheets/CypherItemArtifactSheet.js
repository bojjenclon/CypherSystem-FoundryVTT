import { ImprovedItemSheet } from './ImprovedItemSheet.js';

export class CypherItemArtifactSheet extends ImprovedItemSheet {
    /**
     * Define default rendering options for the weapon sheet
     * @return {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 500,
            height: 450
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
        return "systems/cyphersystem/templates/item/ArtifactSheet.html";
    }

    get type() {
        return "artifact";
    }
    
    getData() {
        const sheetData = super.getData();

        sheetData.isGM = game.user.isGM;

        return sheetData;
    }
}