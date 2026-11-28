const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });
const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' });
const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' });

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function when(iso: string, now = Date.now()) {
  const at = new Date(iso);
  const ago = now - at.getTime();
  if (ago < MINUTE) return 'Just now';
  if (ago < HOUR) {
    const minutes = Math.floor(ago / MINUTE);
    return minutes === 1 ? '1 minute ago' : `${String(minutes)} minutes ago`;
  }
  if (ago < 3 * HOUR) {
    const hours = Math.floor(ago / HOUR);
    return hours === 1 ? '1 hour ago' : `${String(hours)} hours ago`;
  }
  const days = Math.round((startOfDay(new Date(now)) - startOfDay(at)) / (24 * HOUR));
  if (days === 0) return `Today, ${time.format(at)}`;
  if (days === 1) return `Yesterday, ${time.format(at)}`;
  if (days < 7) return weekday.format(at);
  return day.format(at);
}

export function dayLabel(isoDay: string) {
  const [year = 0, month = 1, date = 1] = isoDay.split('-').map(Number);
  return day.format(new Date(year, month - 1, date));
}

export function counted(count: number, one: string, many = `${one}s`) {
  return `${String(count)} ${count === 1 ? one : many}`;
}

export function dueLabel(isoDay: string, now = Date.now()) {
  const [year = 0, month = 1, date = 1] = isoDay.split('-').map(Number);
  const days = Math.round(
    (new Date(year, month - 1, date).getTime() - startOfDay(new Date(now))) / (24 * HOUR),
  );
  if (days < 0) return { text: 'Overdue', urgent: true };
  if (days === 0) return { text: 'Due today', urgent: true };
  if (days === 1) return { text: 'Due tomorrow', urgent: false };
  if (days < 7) return { text: 'This week', urgent: false };
  return { text: `Due ${dayLabel(isoDay)}`, urgent: false };
}
