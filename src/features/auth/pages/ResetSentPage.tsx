import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router';

import { PageHeader } from '@/components/layout';
import { Button, FormError, LinkButton, useToast } from '@/components/ui';
import { HttpError, NetworkError, paths } from '@/lib';

import { askForReset } from '../api';
import { MockLink } from '../components/MockLink';

function emailFrom(state: unknown) {
  if (typeof state !== 'object' || state === null || !('email' in state)) return null;
  return typeof state.email === 'string' ? state.email : null;
}

export function ResetSentPage() {
  const email = emailFrom(useLocation().state);
  const toast = useToast();
  const [sent, setSent] = useState(0);
  const again = useMutation({
    mutationFn: askForReset,
    onSuccess: () => {
      setSent((count) => count + 1);
      toast('Reset link sent again');
    },
  });

  if (!email) return <Navigate to={paths.forgotPassword} replace />;

  const failed =
    again.error instanceof HttpError || again.error instanceof NetworkError
      ? again.error.message
      : null;

  return (
    <>
      <PageHeader
        title="Check your email"
        lede={`If ${email} has an account, a reset link is on its way. The link works for 1 hour.`}
      />
      <FormError message={failed} />
      <MockLink sent={sent} />
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" loading={again.isPending} onClick={() => again.mutate({ email })}>
          Send it again
        </Button>
        <LinkButton to={paths.forgotPassword} variant="ghost">
          Use a different email
        </LinkButton>
      </div>
    </>
  );
}
