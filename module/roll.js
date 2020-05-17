/* Dice roll for CypherSystem

Rolls a d20 and then determines your success level. Handles 1s, 19s and 20s too.
*/
export function cypherRoll(levelModifier = 0) {
  const d20 = new Roll("d20").roll();

  d20.level = Math.floor(d20.total / 3) + levelModifier;

  return d20;
}

export function rollText(dieRoll) {
  let parts = [];

  const tnReached = Math.floor(dieRoll / 3);
  let tnColor = '#000000';
  if (tnReached < 3) {
    tnColor = '#0a860a';
  } else if (tnReached < 7) {
    tnColor = '#848409';
  } else {
    tnColor = '#0a860a';
  }
  parts.push({
    text: `<${tnReached}>`,
    color: tnColor,
    cls: 'target-number'
  })

  switch (dieRoll) {
    case 1:
      parts.push({
        text: "GM Intrusion",
        color: '#000000',
        cls: 'effect'
      });
      break;

    case 19:
      parts.push({
        text: "Minor Effect",
        color: '#000000',
        cls: 'effect'
      });
      break;

    case 20:
      parts.push({
        text: "Major Effect",
        color: '#000000',
        cls: 'effect'
      });
      break;
  }

  return parts;
}

export class CypherRolls {
  static async Roll({ parts = [], data = {}, actor = null, event = null, speaker = null, flavor = null, title = null, item = false } = {}) {
    let rollMode = game.settings.get('core', 'rollMode');
    let rolled = false;
    let filtered = parts.filter(function (el) {
      return el != '' && el;
    });

    let maxEffort = 1;
    if (!!data['maxEffort']) {
      maxEffort = parseInt(data['maxEffort'], 10) || 1;
    }

    let assets = 0;
    if (!!data['assets']) {
      assets = parseInt(data['assets'], 10) || 1;
    }

    const _roll = (form = null) => {
      // Optionally include effort
      if (form !== null) {
        data['effort'] = parseInt(form.effort.value, 10);
      }
      if (!!data['effort']) {
        flavor += ` with ${data['effort']} Effort`
      }

      const roll = new Roll(filtered.join(''), data).roll();
      // Convert the roll to a chat message and return the roll
      rollMode = form ? form.rollMode.value : rollMode;
      rolled = true;
      
      return roll;
    }

    const template = 'systems/cypher-system/templates/dialogs/roll-dialog.html';
    let dialogData = {
      formula: filtered.join(' '),
      maxEffort: maxEffort,
      data: data,
      rollMode: rollMode,
      rollModes: CONFIG.rollModes
    };

    const html = await renderTemplate(template, dialogData);
    //Create Dialog window
    let roll;
    return new Promise(resolve => {
      new Dialog({
        title: title,
        content: html,
        buttons: {
          ok: {
            label: 'OK',
            icon: '<i class="fas fa-check"></i>',
            callback: (html) => {
              roll = _roll(html[0].children[0]);

              // TODO: check roll.result against target number

              const { statId } = data;
              const amountOfEffort = parseInt(data['effort'] || 0, 10);
              const effortCost = actor.getEffortCostFromStat(statId, amountOfEffort);
              const totalCost = parseInt(data['abilityCost'], 10) + parseInt(effortCost.cost, 10);

              if (actor.canSpendFromPool(statId, totalCost)) {
                roll.toMessage({
                  speaker: speaker,
                  flavor: flavor
                }, { rollMode });

                actor.spendFromPool(statId, totalCost);
              } else {
                const poolName = statId[0].toUpperCase() + statId.substr(1);
                ChatMessage.create([{
                  speaker,
                  flavor: 'Roll Failed',
                  content: `Not enough points in ${poolName} pool.`
                }])
              }
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Cancel',
          },
        },
        default: 'ok',
        close: () => {
          resolve(rolled ? roll : false);
        }
      }).render(true);
    });
  }
}