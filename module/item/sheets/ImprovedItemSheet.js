export class ImprovedItemSheet extends ItemSheet {
	constructor(...args) {
		super(...args);

		this.focusedInputPath = null;
		this.inputPosStart = 0;
		this.inputPosEnd = 0;
	}

	activateListeners(html) {
		super.activateListeners(html);

		const self = this;

		// If returning from an auto-submit, restore the focused input's caret position
		const { focusedInputPath } = this;
		if (focusedInputPath) {
			const { inputPosStart, inputPosEnd } = this;

			const focusedInput = $(focusedInputPath);
			if (focusedInput) {
				const inputEl = focusedInput[0];
				inputEl.setSelectionRange(inputPosStart, inputPosEnd);
			}

			self.focusedInputPath = null;
			self.inputPosStart = self.inputPosEnd = 0;
		}

		// Auto-submit the form after input
		let keyUpTimeout;
		const getKeyUpFn = (delay) => {
			return ev => {
				if (keyUpTimeout) {
					clearTimeout(keyUpTimeout);
				}

				keyUpTimeout = setTimeout(() => {
					const focusedInput = ev.currentTarget;

					self.inputPosStart = focusedInput.selectionStart;
					self.inputPosEnd = focusedInput.selectionEnd;

					const form = $(focusedInput).parents('form:first');

					self.focusedInputPath = `#${form.attr('id')} input[name="${$(focusedInput).attr('name')}"]`;

					form.submit();
				}, delay);
			};
		};

    $('input[type="text"]').keyup(getKeyUpFn(100));
    // For now, type="number" isn't supported as it doesn't have the setSelectionRange method
	}
}
