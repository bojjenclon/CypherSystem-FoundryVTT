import { CYPHER_SYSTEM } from "../../Config.js";

export class CypherItemArmorSheet extends ItemSheet {
    /**
     * Define default rendering options for the weapon sheet
     * @return {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 600,
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
        return "systems/cyphersystem/templates/item/armorSheet.html";
    }

    getData() {
        const data = super.getData();

        data.weightClasses = CYPHER_SYSTEM.weightClasses;
        
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        $('select[name="data.weight"]').select2({
            theme: 'numenera',
            width: '100px',
            minimumResultsForSearch: Infinity
        });
    }
}