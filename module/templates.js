/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async() => {

    // Define template paths to load
    const templatePaths = [

        // Actor Sheets
        "systems/cypher-system/templates/characterSheet.html",
        "systems/cypher-system/templates/npcSheet.html",

        // Actor Partials
        "systems/cypher-system/templates/partials/actor/characterSentence.html",
        "systems/cypher-system/templates/partials/actor/header.html",
        "systems/cypher-system/templates/partials/actor/skillsTab.html",
        "systems/cypher-system/templates/partials/actor/abilitiesTab.html",
        "systems/cypher-system/templates/partials/actor/cyphersTab.html",
        "systems/cypher-system/templates/partials/actor/equipmentTab.html",
        "systems/cypher-system/templates/partials/actor/bioTab.html",

        //Item Sheets
        "systems/cypher-system/templates/item/abilitySheet.html",
        "systems/cypher-system/templates/item/armorSheet.html",
        "systems/cypher-system/templates/item/artifactSheet.html",
        "systems/cypher-system/templates/item/cypherSheet.html",
        "systems/cypher-system/templates/item/gearSheet.html",
        "systems/cypher-system/templates/item/odditySheet.html",
        "systems/cypher-system/templates/item/skillSheet.html",
        "systems/cypher-system/templates/item/weaponSheet.html",
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};