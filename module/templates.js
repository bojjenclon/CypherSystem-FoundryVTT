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

        //Item sheets
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