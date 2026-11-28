import { useState } from 'react';

import { AiSuggestion, FlaggedText } from '@/components/domain';
import { Button, Checkbox } from '@/components/ui';

function Rewrite() {
  return (
    <>
      Users shall be able to reset their password <del>at any time</del>{' '}
      <ins>
        through an emailed link that stays valid for 1 hour, except during an active lockout
      </ins>
      .
    </>
  );
}

export function Suggestions() {
  const [accepted, setAccepted] = useState(false);
  const [hot, setHot] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-statement">
        Users shall be able to <FlaggedText findings={[1]}>reset their password</FlaggedText>{' '}
        <FlaggedText findings={[2, 3]} active={hot}>
          at any time
        </FlaggedText>
        .
      </p>
      <Checkbox
        label="Highlight findings 2 and 3, as when hovering them"
        checked={hot}
        onChange={(event) => setHot(event.target.checked)}
      />
      <AiSuggestion
        accepted={accepted}
        onAccept={() => setAccepted(true)}
        onEdit={() => setAccepted(false)}
      >
        <Rewrite />
      </AiSuggestion>
      {accepted && (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setAccepted(false)}>
          Reset
        </Button>
      )}
    </div>
  );
}
