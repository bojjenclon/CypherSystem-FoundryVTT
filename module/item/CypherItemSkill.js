export class CypherItemSkill extends Item {
  get type() {
      return "gear";
  }

  prepareData() {
      super.prepareData();

      const itemData = this.data.data || {};

      itemData.name = this.data ? this.data.name : "New Skill";
      itemData.notes = itemData.notes || "";
      itemData.stat = itemData.stat || "";
      itemData.inability = itemData.inability || false;
      itemData.trained = itemData.trained || false;
      itemData.specialized = itemData.specialized || false;
  }

    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    async roll() {
      // Basic template rendering data
      const token = this.actor.token;
      const item = this.data;
      const actorData = this.actor ? this.actor.data.data : {};
      const itemData = item.data;

      // Define the roll formula.
      let roll = new Roll('d20+@abilities.str.mod', actorData);
      let label = `Rolling ${item.name}`;

      // Roll and send to chat.
      roll.roll().toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: label
      });
  }
}