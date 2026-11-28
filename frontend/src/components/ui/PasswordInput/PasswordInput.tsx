import { type ComponentProps, useState } from 'react';

import { Icon } from '@/components/domain/Icon';
import { cn } from '@/lib';

import { Input } from '../Input';

type Props = Omit<ComponentProps<'input'>, 'type'>;

export function PasswordInput({ className, ...props }: Props) {
  const [shown, setShown] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <Input {...props} type={shown ? 'text' : 'password'} className="pr-11" />
      <button
        type="button"
        aria-label={shown ? 'Hide password' : 'Show password'}
        onClick={() => setShown(!shown)}
        className="absolute inset-y-0 right-0 grid w-10 cursor-pointer place-items-center rounded-r-sm text-text-3 transition-theme hover:text-text"
      >
        <Icon name={shown ? 'eye-slash' : 'eye'} />
      </button>
    </div>
  );
}
