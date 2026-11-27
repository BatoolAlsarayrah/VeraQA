import type { ActivityEntry } from '@/types';

export function actorName(entry: ActivityEntry) {
  return entry.actor.type === 'ai' ? 'AI analysis' : entry.actor.name;
}

export function activityText(entry: ActivityEntry) {
  const { id, title } = entry.item;
  const run = `Run ${id} · ${title}`;
  switch (entry.action) {
    case 'uploaded':
      return `uploaded ${title}`;
    case 'analyzed':
      return `analyzed ${title}`;
    case 'flagged':
      return `flagged ${String(entry.count ?? 1)} issues in ${title}`;
    case 'drafted':
      return entry.count ? `drafted ${String(entry.count)} items from ${id}` : `drafted ${id}`;
    case 'approved':
      return `approved ${id}`;
    case 'rejected':
      return `rejected ${id}`;
    case 'edited':
      return `edited ${id}`;
    case 'started-run':
      return `started ${run}`;
    case 'passed':
      return `passed ${id}`;
    case 'failed':
      return `failed ${id}`;
    case 'blocked':
      return `marked ${id} as blocked`;
    case 'reported':
      return `reported ${id}`;
    case 'started-fixing':
      return `moved ${id} to In progress`;
    case 'marked-fixed':
      return `marked ${id} as fixed`;
    case 'marked-invalid':
      return `marked ${id} as invalid`;
    case 'retest-passed':
      return `closed ${id} after a passed retest`;
    case 'retest-failed':
      return `reopened ${id} after a failed retest`;
    case 'reopened':
      return `reopened ${id}`;
    case 'joined':
      return 'joined the project';
  }
}
