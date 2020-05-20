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
import { CypherItemGearSheet } from './module/item/sheets/CypherItemGearSheet.js';
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
    Items.registerSheet("cypher-system", CypherItemGearSheet, { types: ["gear"], makeDefault: true });
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

Hooks.on("renderChatMessage", (chatMessage, html, data) => {
    //Don't apply ChatMessage enhancement to recovery rolls
    if (chatMessage.roll && chatMessage.roll.dice[0].faces === 20)
    {
        const dieRoll = chatMessage.roll.dice[0].rolls[0].roll;
        const rollTotal = chatMessage.roll.total;
        const messages = rollText(dieRoll, rollTotal);
        const numMessages = messages.length;

        const messageContainer = $('<div/>');
        messageContainer.addClass('special-messages');

        messages.forEach((special, idx) => {
            const { text, color, cls } = special;

            const newContent = `<span class="${cls}" style="color: ${color}">${text}</span>${idx < numMessages - 1 ? '<br />' : ''}`;

            messageContainer.append(newContent);
        });

        const dt = html.find("h4.dice-total");
        messageContainer.insertBefore(dt);
    }
});

/**
 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
 */
Hooks.once("ready", migrateWorld);

Handlebars.registerHelper({
    or: (v1, v2) => {
        return v1 || v2;
    },

    ternary: (cond, v1, v2) => {
        return cond ? v1 : v2;
    },

    strOrSpace: (val) => {
        if (typeof val === 'string') {
            return (val && !!val.length) ? val : '&nbsp;';
        }
        
        return val;
    }
});
