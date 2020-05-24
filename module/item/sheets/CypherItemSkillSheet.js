import { CYPHER_SYSTEM } from "../../Config.js";

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
        return "systems/cyphersystem/templates/item/SkillSheet.html";
    }

    getData() {
        const sheetData = super.getData();

        sheetData.stats = CYPHER_SYSTEM.stats;
        sheetData.skillLevels = CYPHER_SYSTEM.skillLevels;

        // const { item } = this;
        // const itemData = item.data.data;
        // if (itemData.inability) {
        //     sheetData.training = 'i';
        // } else if (itemData.untrained) {
        //     sheetData.training = 'u';
        // } else if (itemData.trained) {
        //     sheetData.training = 't';
        // } else if (itemData.specialized) {
        //     sheetData.training = 's';
        // }

        return sheetData;
    }

    activateListeners(html) {
        super.activateListeners(html);

        const { item } = this;

        $('select[name="data.stat"]').select2({
            theme: 'numenera',
            width: '110px',
            minimumResultsForSearch: Infinity
        });

        const trainingSelect = $('select[name="data.training"]').select2({
            theme: 'numenera',
            width: '110px',
            minimumResultsForSearch: Infinity
        });
        // trainingSelect.on('change', ev => {
        //     ev.preventDefault();

        //     const elem = $(ev.currentTarget);
        //     const selected = elem.val();

        //     switch (selected) {
        //         case 'i':
        //             item.update({
        //                 'data.inability': true,
        //                 'data.untrained': false,
        //                 'data.trained': false,
        //                 'data.specialized': false
        //             });
                    
        //             break;

        //         case 'u':
        //             item.update({
        //                 'data.inability': false,
        //                 'data.untrained': true,
        //                 'data.trained': false,
        //                 'data.specialized': false
        //             });

        //             break;

        //         case 't':
        //             item.update({
        //                 'data.inability': false,
        //                 'data.untrained': false,
        //                 'data.trained': true,
        //                 'data.specialized': false
        //             });

        //             break;

        //         case 's':
        //             item.update({
        //                 'data.inability': false,
        //                 'data.untrained': false,
        //                 'data.trained': false,
        //                 'data.specialized': true
        //             });

        //             break;
        //     }
        // });
    }
}
