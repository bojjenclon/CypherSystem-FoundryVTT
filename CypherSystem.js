import { CypherActor } from './module/actor/CypherActor.js';
import { CypherActorNPCSheet } from './module/actor/sheets/CypherActorNPCSheet.js';
import { CypherActorPCSheet } from './module/actor/sheets/CypherActorPCSheet.js';

import { CYPHER_SYSTEM } from './module/Config.js';
import { getInitiativeFormula, rollInitiative } from './module/Combat.js';
import { rollText } from './module/Roll.js';
import { preloadHandlebarsTemplates } from './module/Templates.js';
import { registerSystemSettings } from './module/Settings.js';
import { csrSocketListeners } from './module/Socket.js';

import { CypherItem } from './module/item/CypherItem.js';
import { CypherItemAbilitySheet } from './module/item/sheets/CypherItemAbilitySheet.js';
import { CypherItemArmorSheet } from './module/item/sheets/CypherItemArmorSheet.js';
import { CypherItemArtifactSheet } from './module/item/sheets/CypherItemArtifactSheet.js';
import { CypherItemCypherSheet } from './module/item/sheets/CypherItemCypherSheet.js';
import { CypherItemGearSheet } from './module/item/sheets/CypherItemGearSheet.js';
import { CypherItemOdditySheet } from './module/item/sheets/CypherItemOdditySheet.js';
import { CypherItemSkillSheet } from './module/item/sheets/CypherItemSkillSheet.js';
import { CypherItemWeaponSheet } from './module/item/sheets/CypherItemWeaponSheet.js';

import { migrateWorld } from './module/migrations/Migrate.js';

Hooks.once("init", function () {
    console.log('Cypher System | Initializing Cypher System FoundryVTT System');

    game.csr = {
        rollItemMacro
    };

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
    Actors.registerSheet("cyphersystem", CypherActorNPCSheet, { types: ["npc"], makeDefault: true });
    Actors.registerSheet("cyphersystem", CypherActorPCSheet, { types: ["pc"], makeDefault: true });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("cyphersystem", CypherItemAbilitySheet, { types: ["ability"], makeDefault: true });
    Items.registerSheet("cyphersystem", CypherItemArmorSheet, { types: ["armor"], makeDefault: true });
    Items.registerSheet("cyphersystem", CypherItemArtifactSheet, { types: ["artifact"], makeDefault: true });
    Items.registerSheet("cyphersystem", CypherItemCypherSheet, { types: ["cypher"], makeDefault: true });
    Items.registerSheet("cyphersystem", CypherItemGearSheet, { types: ["gear"], makeDefault: true });
    Items.registerSheet("cyphersystem", CypherItemOdditySheet, { types: ["oddity"], makeDefault: true });
    Items.registerSheet("cyphersystem", CypherItemSkillSheet, { types: ["skill"], makeDefault: true });
    Items.registerSheet("cyphersystem", CypherItemWeaponSheet, { types: ["weapon"], makeDefault: true });

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
    if (chatMessage.roll && chatMessage.roll.dice[0].faces === 20) {
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
 * Add additional system-specific sidebar directory context menu options for CSR Actor entities
 * 
 * @param {jQuery} html         The sidebar HTML
 * @param {Array} entryOptions  The default array of context menu options
 */
Hooks.on("getActorDirectoryEntryContext", (html, entryOptions) => {
    entryOptions.push({
        name: "GM Intrusion",
        icon: '<i class="fas fa-exclamation-circle"></i>',
        callback: li => {
            const actor = game.actors.get(li.data("entityId"));
            const ownerIds = Object.entries(actor.data.permission)
                .filter(entry => {
                    const [id, permissionLevel] = entry;
                    return permissionLevel >= ENTITY_PERMISSIONS.OWNER
                        && id !== game.user.id
                })
                .map(usersPermissions => usersPermissions[0]);

            game.socket.emit("system.cyphersystem", {
                type: "gmIntrusion",
                data: {
                    userIds: ownerIds,
                    actorId: actor.data._id,
                }
            });

            ChatMessage.create({
                content: `<h2>GM Intrusion</h2><br/>The GM offers an intrusion to ${actor.data.name}`,
            });
        },
        condition: li => {
            if (!game.user.isGM) {
                return false;
            }

            const actor = game.actors.get(li.data("entityId"));
            return actor && actor.data.type === "pc";
        }
    });
});

Handlebars.registerHelper({
    eq: (v1, v2) => v1 === v2,
    neq: (v1, v2) => v1 !== v2,
    or: (v1, v2) => v1 || v2,
    ternary: (cond, v1, v2) => cond ? v1 : v2,

    allCaps: (text) => text.toUpperCase(),

    strOrSpace: val => {
        if (typeof val === 'string') {
            return (val && !!val.length) ? val : '&nbsp;';
        }

        return val;
    },

    sortIcon: (sortInfo, field) => {
        if (sortInfo.field !== field) {
            return '';
        }

        return `&nbsp;<i class="fas fa-long-arrow-alt-${sortInfo.asc ? 'up' : 'down'}"></i>`;
    }
});

/* -------------------------------------------- */
/*  Ready Hooks                                 */
/* -------------------------------------------- */
Hooks.once("ready", migrateWorld);
Hooks.once("ready", csrSocketListeners);
Hooks.once('ready', async () => {
    // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
    Hooks.on("hotbarDrop", (bar, data, slot) => createCypherSystemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */
/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * 
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * 
 * @returns {Promise}
 */
async function createCypherSystemMacro(data, slot) {
    if (data.type !== "Item") {
        return;
    }

    if (!("data" in data)) {
        return ui.notifications.warn("You can only create macro buttons for owned Items");
    }

    const item = data.data;

    if (!CYPHER_SYSTEM.supportsMacros.includes(item.type)) {
        return ui.notifications.warn("This type of Item doesn't support being macroed");
    }

    // Create the macro command
    const command = `game.csr.rollItemMacro("${item._id}");`;
    let macro = game.macros.entities.find(m => (m._id === item._id) && (m.command === command));
    if (!macro) {
        macro = await Macro.create({
            name: item.name,
            type: "script",
            img: item.img,
            command: command,
            flags: { "csr.itemMacro": true }
        });
    }

    game.user.assignHotbarMacro(macro, slot);

    return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemId
 * @return {Promise}
 */
function rollItemMacro(itemId) {
    const speaker = ChatMessage.getSpeaker();

    let actor;
    if (speaker.token) {
        actor = game.actors.tokens[speaker.token];
    }
    if (!actor) {
        actor = game.actors.get(speaker.actor);
    }

    const item = actor ? actor.items.find(i => i._id === itemId) : null;
    if (!item) {
        return ui.notifications.warn(`Your controlled Actor does not have an item with the id ${itemId}`);
    }

    // Trigger the item roll
    return item.roll();
}
