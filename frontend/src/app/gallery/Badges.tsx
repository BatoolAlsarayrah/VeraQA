import { useState } from 'react';

import {
  AiDraftMark,
  Avatar,
  IdTag,
  type MarkerState,
  type Priority,
  PriorityBadge,
  RowMarker,
  type Status,
  StatusBadge,
} from '@/components/domain';
import { Badge, Button, type Tone } from '@/components/ui';

import { Row } from './Row';

const tones: Tone[] = ['neutral', 'ok', 'bad', 'warn', 'progress', 'ai', 'bad-fill'];
const statuses: Status[] = [
  'pending-review',
  'ai-draft',
  'approved',
  'rejected',
  'not-run',
  'passed',
  'failed',
  'blocked',
  'open',
  'in-progress',
  'fixed',
  'retest',
  'reopened',
  'closed',
  'invalid',
];
const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];
const markers: MarkerState[] = ['draft', 'approved', 'approved-case', 'rejected'];

export function Badges() {
  const [decided, setDecided] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <Row label="Badge tones">
        {tones.map((tone) => (
          <Badge key={tone} tone={tone}>
            {tone}
          </Badge>
        ))}
      </Row>
      <Row label="Status">
        {statuses.map((status) => (
          <StatusBadge key={status} status={status} />
        ))}
      </Row>
      <Row label="Pending review: a person's item, then an AI-made item">
        <StatusBadge status="pending-review" />
        <StatusBadge status="pending-review" ai />
      </Row>
      <Row label="Priority">
        {priorities.map((level) => (
          <PriorityBadge key={level} level={level} />
        ))}
      </Row>
      <Row label="AI draft mark and row markers">
        <AiDraftMark />
        <AiDraftMark label />
        {markers.map((state) => (
          <RowMarker key={state} state={state} />
        ))}
      </Row>
      <Row label="Mark fill on approval">
        <RowMarker state={decided ? 'approved' : 'draft'} />
        <Button size="sm" onClick={() => setDecided(!decided)}>
          {decided ? 'Undo' : 'Approve'}
        </Button>
      </Row>
      <Row label="IDs and avatars">
        <IdTag>REQ-014</IdTag>
        <IdTag to="#badges">REQ-014</IdTag>
        <IdTag>Run 12</IdTag>
        <Avatar name="Batool Hani" size={24} />
        <Avatar name="Batool Hani" />
        <Avatar name="Qays Kaled" size={36} />
      </Row>
    </div>
  );
}
