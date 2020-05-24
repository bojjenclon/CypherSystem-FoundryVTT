/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * 
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * 
 * @returns {Promise}
 */
export async function createCypherSystemMacro(data, slot) {
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
export function rollItemMacro(itemId) {
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
