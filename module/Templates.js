/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async() => {

    // Define template paths to load
    const templatePaths = [

        // Actor Sheets
        "systems/cyphersystem/templates/PCSheet.html",
        "systems/cyphersystem/templates/NPCSheet.html",

        // Actor Partials
        "systems/cyphersystem/templates/partials/actor/CharacterSentence.html",
        "systems/cyphersystem/templates/partials/actor/Header.html",
        "systems/cyphersystem/templates/partials/actor/SkillsTab.html",
        "systems/cyphersystem/templates/partials/actor/AbilitiesTab.html",
        "systems/cyphersystem/templates/partials/actor/CyphersTab.html",
        "systems/cyphersystem/templates/partials/actor/EquipmentTab.html",
        "systems/cyphersystem/templates/partials/actor/BioTab.html",

        //Item Sheets
        "systems/cyphersystem/templates/item/AbilitySheet.html",
        "systems/cyphersystem/templates/item/ArmorSheet.html",
        "systems/cyphersystem/templates/item/ArtifactSheet.html",
        "systems/cyphersystem/templates/item/CypherSheet.html",
        "systems/cyphersystem/templates/item/GearSheet.html",
        "systems/cyphersystem/templates/item/OdditySheet.html",
        "systems/cyphersystem/templates/item/SkillSheet.html",
        "systems/cyphersystem/templates/item/WeaponSheet.html",
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};