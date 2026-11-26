import { Link } from 'react-router';

import { PageHeader } from '@/components/layout';
import { paths } from '@/lib';

export function SignInPage() {
  return (
    <>
      <PageHeader title="Sign in" />
      {import.meta.env.DEV && (
        <p className="text-body-sm text-text-2">
          Development build: <Link to={paths.dev}>open dev tools</Link> to sign in as a demo person.
        </p>
      )}
    </>
  );
}
