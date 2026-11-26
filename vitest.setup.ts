import '@testing-library/jest-dom/vitest';

import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

import { queryClient } from '@/lib';

// Route tests load the whole app and mock server; a full parallel run can outlast the 1s default.
configure({ asyncUtilTimeout: 3000 });

// jsdom has no <dialog> or popover support, so these mimic the browser's open state and events.
// The guard lets the few tests that need Node's own fetch, FormData and File run without jsdom.
if (typeof window !== 'undefined') {
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
}

// Globals are off, so React Testing Library can't register its own cleanup.
afterEach(() => {
  cleanup();
  queryClient.clear();
  if (typeof window === 'undefined') return;
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});
