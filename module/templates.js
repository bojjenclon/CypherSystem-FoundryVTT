/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async() => {

    // Define template paths to load
    const templatePaths = [

        // Actor Sheets
        "systems/cyphersystem/templates/characterSheet.html",
        "systems/cyphersystem/templates/npcSheet.html",

        // Actor Partials
        "systems/cyphersystem/templates/partials/actor/characterSentence.html",
        "systems/cyphersystem/templates/partials/actor/header.html",
        "systems/cyphersystem/templates/partials/actor/skillsTab.html",
        "systems/cyphersystem/templates/partials/actor/abilitiesTab.html",
        "systems/cyphersystem/templates/partials/actor/cyphersTab.html",
        "systems/cyphersystem/templates/partials/actor/equipmentTab.html",
        "systems/cyphersystem/templates/partials/actor/bioTab.html",

        //Item Sheets
        "systems/cyphersystem/templates/item/abilitySheet.html",
        "systems/cyphersystem/templates/item/armorSheet.html",
        "systems/cyphersystem/templates/item/artifactSheet.html",
        "systems/cyphersystem/templates/item/cypherSheet.html",
        "systems/cyphersystem/templates/item/gearSheet.html",
        "systems/cyphersystem/templates/item/odditySheet.html",
        "systems/cyphersystem/templates/item/skillSheet.html",
        "systems/cyphersystem/templates/item/weaponSheet.html",
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};