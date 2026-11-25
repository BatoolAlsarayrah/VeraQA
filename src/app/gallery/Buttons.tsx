import { useState } from 'react';

import { BackButton, Button, LinkButton } from '@/components/ui';

import { Row } from './Row';

const variants = ['primary', 'secondary', 'danger', 'danger-fill', 'ghost', 'ai'] as const;

export function Buttons() {
  const [approved, setApproved] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {variants.map((variant) => (
        <Row key={variant} label={variant}>
          <Button variant={variant} size="sm">
            Small
          </Button>
          <Button variant={variant}>Medium</Button>
          <Button variant={variant} size="lg">
            Large
          </Button>
          <Button variant={variant} icon="plus">
            Add requirement
          </Button>
          <Button variant={variant} disabled>
            Disabled
          </Button>
          <Button variant={variant} loading>
            Saving
          </Button>
        </Row>
      ))}
      <Row label="Icon only, link, back">
        <Button icon="x" aria-label="Close" size="sm" />
        <Button icon="plus" aria-label="Add requirement" />
        <LinkButton href="#buttons" variant="primary">
          Review 5 requirements
        </LinkButton>
        <BackButton href="#buttons" label="Defects" />
      </Row>
      <Row label="Approve (check draw)">
        <Button variant="primary" approved={approved} onClick={() => setApproved(true)}>
          Approve requirement
        </Button>
        {approved && (
          <Button variant="ghost" size="sm" onClick={() => setApproved(false)}>
            Reset
          </Button>
        )}
      </Row>
    </div>
  );
}
