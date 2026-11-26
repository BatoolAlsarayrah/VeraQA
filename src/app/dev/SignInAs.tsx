import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { paths } from '@/lib';

import { people, signedInAs, signInAs } from './mock';

export function SignInAs() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(signedInAs);

  return (
    <Panel title="Sign in as" list>
      <ul className="divide-y divide-border">
        {people().map((person) => (
          <li
            key={person.id}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 tablet:px-6"
          >
            <span className="flex min-w-0 flex-col">
              <span className="font-semibold text-text">{person.name}</span>{' '}
              <span className="text-body-sm text-text-2">{person.email}</span>
            </span>
            {person.id === current ? (
              <span className="text-body-sm text-text-2">Signed in</span>
            ) : (
              <Button
                onClick={() => {
                  signInAs(person.id);
                  setCurrent(person.id);
                  void navigate(paths.projects);
                }}
              >
                Sign in as {person.name}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
