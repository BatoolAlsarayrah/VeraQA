import type { ComponentProps } from 'react';

import { Avatar } from '@/components/domain/Avatar';
import { Popover } from '@/components/ui/Popover';

import { AccountCard } from './AccountCard';

export function AccountMenu(props: ComponentProps<typeof AccountCard>) {
  return (
    <Popover
      label="Account"
      align="end"
      className="w-70"
      trigger={(trigger) => (
        <button
          type="button"
          {...trigger}
          aria-label={`Account, ${props.user.name}`}
          className="grid shrink-0 cursor-pointer place-items-center rounded-full"
        >
          <Avatar name={props.user.name} size={36} />
        </button>
      )}
    >
      <AccountCard {...props} />
    </Popover>
  );
}
