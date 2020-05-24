import { CYPHER_SYSTEM } from "../../config.js";

export class CypherItemSkillSheet extends ItemSheet {
    /**
     * Define default rendering options for the weapon sheet
     * @return {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 500,
            height: 400
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
        return "systems/cypher-system/templates/item/skillSheet.html";
    }

    activateListeners(html) {
        super.activateListeners(html);

        const { item } = this;
        const itemData = item.data.data;

        html.find('.select-skill-level').change(ev => {
            const elem = $(ev.currentTarget);
            const selected = elem.val();

            itemData.inability = false;
            itemData.untrained = false;
            itemData.trained = false;
            itemData.specialized = false;

            switch (selected) {
                case 'i':
                    itemData.inability = true;
                    break;

                case 'u':
                    itemData.untrained = true;
                    break;

                case 't':
                    itemData.trained = true;
                    break;

                case 's':
                    itemData.specialized = true;
                    break;
            }
        });
    }

    getData() {
        const sheetData = super.getData();

        sheetData.stats = CYPHER_SYSTEM.stats;
        sheetData.skillLevels = CYPHER_SYSTEM.skillLevels;

        const { item } = this;
        const itemData = item.data.data;
        if (itemData.inability) {
            sheetData.training = 'i';
        } else if (itemData.untrained) {
            sheetData.training = 'u';
        } else if (itemData.trained) {
            sheetData.training = 't';
        } else if (itemData.specialized) {
            sheetData.training = 's';
        }

        return sheetData;
    }

    activateListeners(html) {
        super.activateListeners(html);

        $('select[name="data.stat"]').select2({
            theme: 'numenera',
            width: '110px',
            minimumResultsForSearch: Infinity
        });

        $('select[name="data.training"]').select2({
            theme: 'numenera',
            width: '110px',
            minimumResultsForSearch: Infinity
        });
    }
}
