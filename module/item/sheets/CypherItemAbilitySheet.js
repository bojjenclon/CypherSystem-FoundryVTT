import { CYPHER_SYSTEM } from "../../config.js";

export class CypherItemAbilitySheet extends ItemSheet {
    /**
     * Define default rendering options for the weapon sheet
     * @return {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 550,
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
        return "systems/cypher-system/templates/item/abilitySheet.html";
    }

    getData() {
        const sheetData = super.getData();

        sheetData.data.ranges = CYPHER_SYSTEM.optionalRanges;
        sheetData.data.stats = CYPHER_SYSTEM.stats;

        return sheetData;
    }

    activateListeners(html) {
        super.activateListeners(html);

        const cbIdentified = html.find('#cb-identified');
        cbIdentified.on('change', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();

            this.item.update({
                'data.identified': ev.target.checked
            });
        });
    }
}