let title: string | null = null;
const listeners = new Set<() => void>();

export function getPageTitle() {
  return title;
}

export function setPageTitle(next: string | null) {
  if (title === next) return;
  title = next;
  listeners.forEach((listener) => listener());
}

export function subscribePageTitle(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
