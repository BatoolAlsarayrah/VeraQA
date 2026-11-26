import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { PageHeader } from '@/components/layout';
import { LinkButton } from '@/components/ui';
import { HttpError, paths } from '@/lib';

import { resetLinkQuery } from '../api';
import { NewPasswordForm } from '../components/NewPasswordForm';

export function ResetPasswordPage() {
  const { token = '' } = useParams();
  const link = useQuery(resetLinkQuery(token));
  const [state, setState] = useState<'open' | 'changed' | 'expired'>('open');
  const dead = link.error instanceof HttpError && link.error.status === 410;

  if (state === 'changed') {
    return (
      <>
        <PageHeader
          title="Password changed"
          lede="You’ve been signed out on other devices. Sign in with your new password."
        />
        <LinkButton to={paths.signin} variant="primary" size="lg" className="w-full">
          Go to sign in
        </LinkButton>
      </>
    );
  }

  if (state === 'expired' || dead) {
    return (
      <>
        <PageHeader
          title="This link has expired"
          lede="Reset links work for 1 hour and only once. Ask for a new one."
        />
        <LinkButton to={paths.forgotPassword} variant="primary" size="lg" className="w-full">
          Send a new link
        </LinkButton>
        <Link to={paths.signin} className="self-start text-body-sm">
          Back to sign in
        </Link>
      </>
    );
  }

  if (link.isPending) return null;

  return (
    <NewPasswordForm
      token={token}
      onChanged={() => setState('changed')}
      onExpired={() => setState('expired')}
    />
  );
}
