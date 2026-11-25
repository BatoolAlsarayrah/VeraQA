import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import { queryClient } from '@/lib';

// jsdom has no <dialog> or popover support, so these mimic the browser's open state and events.
HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
  if (!this.hasAttribute('open')) return;
  this.removeAttribute('open');
  this.dispatchEvent(new Event('close'));
};
HTMLElement.prototype.showPopover = function showPopover(this: HTMLElement) {
  this.dataset.popoverOpen = '';
  this.dispatchEvent(Object.assign(new Event('toggle'), { newState: 'open' }));
};
HTMLElement.prototype.hidePopover = function hidePopover(this: HTMLElement) {
  delete this.dataset.popoverOpen;
  this.dispatchEvent(Object.assign(new Event('toggle'), { newState: 'closed' }));
};

// Globals are off, so React Testing Library can't register its own cleanup.
afterEach(() => {
  cleanup();
  queryClient.clear();
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});
