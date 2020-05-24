/**
 * GM intrusion dialog. Requires a stand-alone class since we need to force
 * the player to answer the dialog question. To do so we:
 * 
 * 1. disable the upper-right corner "X" button
 * 2. disable the Escape key closing the form
 * 3. put no default value
 *
 * @export
 * @class GMIntrusionDialog
 * @extends {Dialog}
 */
export class GMIntrusionDialog extends Dialog {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "templates/hud/dialog.html",
      classes: ["csr", "dialog"],
      width: 500
    });
  }

  constructor(actor, options = {}) {
    let dialogContent = `
    <div class="row">
      <div class="col-xs-12">
        <p>The game master offers you an intrusion. Do you accpet?</p>
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col-xs-6">
        <p>Should you <span style="color: green">accept</span>, the GM will introduce an unexpected complication for your character; however, you will receive 2 XP, 1 of which you must give to another player.</p>
      </div>
      <div class="col-xs-6">
        <p>Should you <span style="color: red">refuse</span>, the complication will not happen but 1 XP will be subtracted from your current amount.</p>
      </div>
    </div>
    <hr />`;

    let dialogButtons = {
      ok: {
        icon: '<i class="fas fa-check" style="color: green"></i>',
        label: "Accept",
        callback: async () => {
          await actor.onGMIntrusion(true);
          super.close();
        }
      },
      cancel: {
        icon: '<i class="fas fa-times" style="color: red"></i>',
        label: "Refuse",
        callback: async () => {
          await actor.onGMIntrusion(false);
          super.close();
        }
      }
    };

    if (!actor.canRefuseIntrusion) {
      dialogContent += `
      <div class="row">
        <div class="col-xs-12">
          <p><strong>You don't have enough XP to refuse the instrusion.</strong></p>
        </div>
      </div>
      <hr />`

      delete dialogButtons.cancel;
    }

    const dialogData = {
      title: "GM Intrusion!",
      content: dialogContent,
      buttons: dialogButtons,
      defaultYes: false,
    };

    super(dialogData, options);

    this.actor = actor;
  }

  /** @override */
  _getHeaderButtons() {
    return [];
  }

  /** @override */
  close() {
    // Default to do nothing (ie. not close)
    // To really close the dialog, use super.close()
  }
} 
