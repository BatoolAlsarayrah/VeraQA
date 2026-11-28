import { TextWithIds } from '@/components/domain';
import { Panel } from '@/components/ui';
import { activityText, actorName, when } from '@/lib';
import type { ActivityEntry } from '@/types';

type Props = { activity: ActivityEntry[]; now: number };

export function RecentActivity({ activity, now }: Props) {
  return (
    <Panel title="Recent activity" list>
      {activity.length === 0 ? (
        <p className="px-4 py-5 text-text-2 tablet:px-6">Nothing has happened yet.</p>
      ) : (
        <ul>
          {activity.map((entry) => (
            <li
              key={entry.id}
              className="border-t border-border px-4 py-3 first:border-t-0 tablet:px-6"
            >
              <p className="text-body-sm text-text">
                <span className="font-semibold">{actorName(entry)}</span>{' '}
                <TextWithIds>{activityText(entry)}</TextWithIds>
              </p>
              <p className="text-caption text-text-2">{when(entry.at, now)}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
