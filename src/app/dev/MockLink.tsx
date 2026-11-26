import { useEffect, useState } from 'react';

import { LinkButton } from '@/components/ui';
import { paths } from '@/lib';

type Props = { sent: number };

// There's no email in mock mode, so a development build opens the link the mock just made.
// app/routes hands it to Check your email, so the auth feature holds no dev-only code.
function Latest({ sent }: Props) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    void import('@/mocks/db').then(({ getDb }) => {
      setToken(getDb().resetLink?.token ?? null);
    });
  }, [sent]);

  if (!token) return null;
  return (
    <LinkButton to={paths.resetPassword(token)} variant="primary" size="lg" className="w-full">
      Open the link from the email
    </LinkButton>
  );
}

function Nothing(_: Props) {
  return null;
}

export const MockLink =
  import.meta.env.DEV && import.meta.env.VITE_API_MODE === 'mock' ? Latest : Nothing;
