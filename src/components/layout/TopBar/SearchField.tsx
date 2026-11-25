import { type FormEvent, useId } from 'react';
import { useNavigate } from 'react-router';

import { Icon } from '@/components/domain/Icon';
import { paths } from '@/lib';

export function SearchField({ placeholder }: { placeholder: string }) {
  const id = useId();
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('q');
    const text = typeof query === 'string' ? query.trim() : '';
    void navigate(text ? `${paths.search}?q=${encodeURIComponent(text)}` : paths.search);
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative w-40 desktop:w-60">
      <label htmlFor={id} className="sr-only">
        Search
      </label>
      <Icon
        name="magnifying-glass"
        size={16}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-3"
      />
      <input
        id={id}
        name="q"
        type="search"
        placeholder={placeholder}
        className="h-9 w-full rounded-sm border border-border bg-field pr-3 pl-8.5 text-body-sm text-text transition-theme placeholder:text-text-3 hover:border-text-3"
      />
    </form>
  );
}
