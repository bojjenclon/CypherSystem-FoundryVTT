import { CypherActor } from './module/actor/CypherActor.js';
import { CypherActorNPCSheet } from './module/actor/sheets/CypherActorNPCSheet.js';
import { CypherActorPCSheet } from './module/actor/sheets/CypherActorPCSheet.js';

import { CYPHER_SYSTEM } from './module/config.js';
import { getInitiativeFormula, rollInitiative } from './module/combat.js';
import { rollText } from './module/roll.js';
import { preloadHandlebarsTemplates } from './module/templates.js';
import { registerSystemSettings } from './module/settings.js';

import { CypherItem } from './module/item/CypherItem.js';
import { CypherItemAbilitySheet } from './module/item/sheets/CypherItemAbilitySheet.js';
import { CypherItemArmorSheet } from './module/item/sheets/CypherItemArmorSheet.js';
import { CypherItemArtifactSheet } from './module/item/sheets/CypherItemArtifactSheet.js';
import { CypherItemCypherSheet } from './module/item/sheets/CypherItemCypherSheet.js';
import { CypherItemEquipmentSheet } from './module/item/sheets/CypherItemEquipmentSheet.js';
import { CypherItemOdditySheet } from './module/item/sheets/CypherItemOdditySheet.js';
import { CypherItemSkillSheet } from './module/item/sheets/CypherItemSkillSheet.js';
import { CypherItemWeaponSheet } from './module/item/sheets/CypherItemWeaponSheet.js';

import { migrateWorld } from './module/migrations/migrate.js';

Hooks.once("init", function() {
    console.log('Cypher System | Initializing Cypher System FoundryVTT System');

    // Record Configuration Values
    CONFIG.CYPHER_SYSTEM = CYPHER_SYSTEM;

    //Dirty trick to instantiate the right class. Kids, do NOT try this at home.
    CONFIG.Actor.entityClass = CypherActor;
    CONFIG.Item.entityClass = CypherItem;

    //Each type of Actor will provide its own personal, free-range, bio, nut-free formula.
    Combat.prototype._getInitiativeFormula = getInitiativeFormula;
    Combat.prototype.rollInitiative = rollInitiative;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("cypher-system", CypherActorNPCSheet, { types: ["npc"], makeDefault: true });
    Actors.registerSheet("cypher-system", CypherActorPCSheet, { types: ["pc"], makeDefault: true });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("cypher-system", CypherItemAbilitySheet, { types: ["ability"], makeDefault: true });
    Items.registerSheet("cypher-system", CypherItemArmorSheet, { types: ["armor"], makeDefault: true });
    Items.registerSheet("cypher-system", CypherItemArtifactSheet, { types: ["artifact"], makeDefault: true });
    Items.registerSheet("cypher-system", CypherItemCypherSheet, { types: ["cypher"], makeDefault: true });
    Items.registerSheet("cypher-system", CypherItemEquipmentSheet, { types: ["equipment"], makeDefault: true });
    Items.registerSheet("cypher-system", CypherItemOdditySheet, { types: ["oddity"], makeDefault: true });
    Items.registerSheet("cypher-system", CypherItemSkillSheet, { types: ["skill"], makeDefault: true });
    Items.registerSheet("cypher-system", CypherItemWeaponSheet, { types: ["weapon"], makeDefault: true });

    registerSystemSettings();
    preloadHandlebarsTemplates();
});
  
/*
Display an NPC's difficulty between parentheses in the Actors list
*/
Hooks.on('renderActorDirectory', (app, html, options) => {
  const found = html.find(".entity-name");
  
  app.entities
      .filter(actor => actor.data.type === 'npc')
      .forEach(actor => {
          found.filter((i, elem) => elem.innerText === actor.data.name)
                .each((i, elem) => elem.innerText += ` (${actor.data.data.level * 3})`);
      })
});

Hooks.on("renderChatMessage", (app, html, data) => {
    //Here, "app" is the ChatMessage object

    //Don't apply ChatMessage enhancement to recovery rolls
    if (app.roll && app.roll.dice[0].faces === 20)
    {
        const dieRoll = app.roll.dice[0].rolls[0].roll;
        const special = rollText(dieRoll);

        //"special" refers to special attributes: minor/major effect or GM intrusion text, special background, etc.
        if (!special)
            return;

        const { text, color } = special;

        const newContent = `<span class="cypher-system-message-special">${text}</span>`;

        const dt = html.find("h4.dice-total");
        $(newContent).insertBefore(dt);
    }
});

/**
 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
 */
Hooks.once("ready", migrateWorld);