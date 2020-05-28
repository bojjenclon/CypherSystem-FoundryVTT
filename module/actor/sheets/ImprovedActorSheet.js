export class ImprovedActorSheet extends ActorSheet {
  constructor(...args) {
		super(...args);

		this.autoSubmitTimeout = null;

		this.focusedInputPath = null;
		this.inputPosStart = 0;
		this.inputPosEnd = 0;

		this.prevScrollY = -1;
		this.scrollWatcher = null;
	}

	activateListeners(html) {
		super.activateListeners(html);

		const self = this;

		// Ensure there isn't a pending auto-submit timeout on refresh
		if (this.autoSubmitTimeout) {
			clearTimeout(this.autoSubmitTimeout);
			this.autoSubmitTimeout = null;
		}

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

		const { prevScrollY } = this;
		if (prevScrollY > -1) {
			html.scrollTop(prevScrollY);
		}

		// Auto-submit the form after input
		const getKeyUpFn = (delay) => {
			return ev => {
				if (this.autoSubmitTimeout) {
					clearTimeout(this.autoSubmitTimeout);
					this.autoSubmitTimeout = null;
				}

				this.autoSubmitTimeout = setTimeout(() => {
					const focusedInput = ev.currentTarget;

					if (focusedInput.value === '') {
						return;
					}

					self.inputPosStart = focusedInput.selectionStart;
					self.inputPosEnd = focusedInput.selectionEnd;

					const form = $(focusedInput).parents('form:first');

					self.focusedInputPath = `#${form.attr('id')} input[name="${$(focusedInput).attr('name')}"]`;

					form.submit();
				}, delay);
			};
		};

		$('input[type="text"]').keyup(getKeyUpFn(100));
		$('input[type="text"]').keydown(ev => {
			if (this.autoSubmitTimeout) {
				clearTimeout(this.autoSubmitTimeout);
				this.autoSubmitTimeout = null;
			}
		});
		// For now, type="number" isn't supported as it doesn't have the setSelectionRange method
		
		// Track the current scroll position in case of page refresh
		if (this.scrollWatcher) {
			clearInterval(this.scrollWatcher);
		}

		this.scrollWatcher = setInterval(() => {
			this.prevScrollY = html.scrollTop();
		}, 100);
	}
}
