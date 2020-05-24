/**
 * Allows the user to choose one of the other player characters.
 * 
 * @export
 * @class PlayerChoiceDialog
 * @extends {Dialog}
 */
export class PlayerChoiceDialog extends Dialog {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "templates/hud/dialog.html",
      classes: ["csr", "dialog", "player-choice"],
      width: 300,
      height: 170
    });
  }

  constructor(actors, onAcceptFn, options = {}) {
    const dialogSelectOptions = [];
    actors.forEach(actor => {
      dialogSelectOptions.push(`<option value=${actor._id}>${actor.name}</option>`)
    });

    const dialogContent = `
    <div class="row">
      <div class="col-xs-12">
        <p>Choose one of the players from the list.</p>
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col-xs-12">
        <select name="player">
          ${dialogSelectOptions.join('\n')}
        </select>
      </div>
    </div>
    <hr />`;

    const dialogButtons = {
      ok: {
        icon: '<i class="fas fa-check"></i>',
        label: "Accept",
        callback: () => {
          const actorId = $('.player-choice select[name="player"]').val();

          onAcceptFn(actorId);

          super.close();
        }
      }
    };

    const dialogData = {
      title: "Choose a Player",
      content: dialogContent,
      buttons: dialogButtons,
      defaultYes: false,
    };

    super(dialogData, options);

    this.actors = actors;
  }

  getData() {
    const sheetData = super.getData();

    sheetData.actors = this.actors;

    return sheetData;
  }

  activateListeners(html) {
    super.activateListeners(html);

    $('select[name="player"]').select2({
      theme: 'numenera',
      width: '100%',
      // minimumResultsForSearch: Infinity
    });
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
