export class RollDialog extends Dialog {
  constructor(dialogData, options) {
    super(dialogData, options);
  }

  activateListeners(html) {
    super.activateListeners(html);

    $('select[name="rollMode"]').select2({
      theme: 'numenera',
      width: '135px',
      minimumResultsForSearch: Infinity
    });
  }
}