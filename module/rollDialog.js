export class RollDialog extends Dialog {
  constructor(dialogData, options) {
    super(dialogData, options);
  }

  activateListeners(html) {
    super.activateListeners(html);

    $('select[name="rollMode"]').select2({
      minimumResultsForSearch: Infinity
    });
  }
}