export class CypherItemCypherSheet extends ItemSheet {
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
        return "systems/cypher-system/templates/item/cypherSheet.html";
    }

    get type() {
        return "cypher";
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