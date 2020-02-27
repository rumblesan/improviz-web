export class UI {
  constructor(eventBus) {
    eventBus.on('display-error', err => this.displayError(err));
    eventBus.on('clear-error', () => this.clearError());
    eventBus.on('clear-error', () => this.clearError());
  }

  performanceMode() {
    document.querySelector('body').classList.add('performance-mode');
  }

  displayError(err) {
    const errorDisplayEl = document.querySelector('#error-display');
    errorDisplayEl.classList.remove('hidden');
    errorDisplayEl.innerText = err.message.substring(0, 10);
  }

  clearError() {
    const errorDisplayEl = document.querySelector('#error-display');
    errorDisplayEl.classList.add('hidden');
    errorDisplayEl.innerText = '';
  }
}
