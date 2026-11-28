const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export function clock(now: number) {
  return {
    ago: (minutes: number) => new Date(now - minutes * MINUTE).toISOString(),
    daysAgo: (days: number, hours = 10, minutes = 0) => {
      const date = new Date(now - days * DAY);
      date.setHours(hours, minutes, 0, 0);
      return date.toISOString();
    },
    day: (offset: number) => new Date(now + offset * DAY).toISOString().slice(0, 10),
  };
}

export type Clock = ReturnType<typeof clock>;
