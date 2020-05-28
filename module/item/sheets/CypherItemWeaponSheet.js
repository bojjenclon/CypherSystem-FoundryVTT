import { CYPHER_SYSTEM } from "../../Config.js";

import { ImprovedItemSheet } from './ImprovedItemSheet.js';

export class CypherItemWeaponSheet extends ImprovedItemSheet {
    /**
     * Define default rendering options for the weapon sheet
     * @return {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 500,
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
        return "systems/cyphersystem/templates/item/WeaponSheet.html";
    }

    getData() {
        const sheetData = super.getData();

        sheetData.ranges = CYPHER_SYSTEM.ranges;
        sheetData.weaponTypes = CYPHER_SYSTEM.weaponTypes;
        sheetData.weights = CYPHER_SYSTEM.weightClasses;

        return sheetData;
    }

    activateListeners(html) {
        super.activateListeners(html);

        $('select[name="data.weight"]').select2({
            theme: 'numenera',
            width: '110px',
            minimumResultsForSearch: Infinity
        });

        $('select[name="data.weaponType"]').select2({
            theme: 'numenera',
            width: '110px',
            minimumResultsForSearch: Infinity
        });

        $('select[name="data.range"]').select2({
            theme: 'numenera',
            width: '110px',
            minimumResultsForSearch: Infinity
        });
    }
}