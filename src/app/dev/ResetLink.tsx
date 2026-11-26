import { useState } from 'react';
import { Link } from 'react-router';

import { Panel } from '@/components/ui/Panel';
import { Switch } from '@/components/ui/Switch';
import { paths } from '@/lib';

import { getFlags, resetLink, setFlags } from './mock';

export function ResetLink() {
  const link = resetLink();
  const [expired, setExpired] = useState(() => getFlags().expiredLinks);

  return (
    <Panel title="Password reset link">
      {link ? (
        <p className="text-body-sm text-text-2">
          Latest link, for {link.email}:{' '}
          <Link to={paths.resetPassword(link.token)} className="break-all">
            {paths.resetPassword(link.token)}
          </Link>
        </p>
      ) : (
        <p className="text-body-sm text-text-2">
          No link yet. Ask for one on <Link to={paths.forgotPassword}>Reset your password</Link>,
          and it shows here, since the mock sends no email.
        </p>
      )}
      <Switch
        label="Make reset links expired"
        description="Every link opens This link has expired, as an hour-old or used link would."
        checked={expired}
        onChange={(event) => {
          setFlags({ expiredLinks: event.target.checked });
          setExpired(event.target.checked);
        }}
      />
    </Panel>
  );
}
