import { useState } from 'react';

import { Icon } from '@/components/domain';
import {
  Button,
  ConfirmDialog,
  Dialog,
  Field,
  Popover,
  Sheet,
  Textarea,
  Tooltip,
  useToast,
} from '@/components/ui';

import { Row } from './Row';

type Open = 'dialog' | 'confirm' | 'sheet' | null;

export function Overlays() {
  const [open, setOpen] = useState<Open>(null);
  const toast = useToast();
  const close = () => setOpen(null);

  return (
    <div className="flex flex-col gap-5">
      <Row label="Modal">
        <Button onClick={() => setOpen('dialog')}>Reject REQ-015</Button>
        <Button variant="danger" onClick={() => setOpen('confirm')}>
          Delete project
        </Button>
        <Button onClick={() => setOpen('sheet')}>Open the More sheet</Button>
      </Row>
      <Row label="Anchored">
        <Popover
          label="Notifications"
          className="w-90"
          trigger={(props) => <Button {...props}>Notifications</Button>}
        >
          <p className="border-b border-border px-4 py-3 text-title">Notifications</p>
          <p className="px-4 py-3 text-body-sm">Qays Kaled moved BUG-009 to In progress</p>
        </Popover>
        <Tooltip label="Dashboard">
          <a
            href="#overlays"
            aria-label="Dashboard"
            className="grid size-10 place-items-center rounded-control bg-rail text-on-rail-2"
          >
            <Icon name="squares-four" />
          </a>
        </Tooltip>
      </Row>
      <Row label="Toast">
        <Button onClick={() => toast('Theme set to dark')}>Show a toast</Button>
        <Button onClick={() => toast('BUG-007 moved to Fixed', { undo: () => {} })}>
          Show a toast with Undo
        </Button>
      </Row>

      <Dialog
        open={open === 'dialog'}
        onClose={close}
        title="Reject REQ-015"
        size="sm"
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="danger-fill" onClick={close}>
              Reject requirement
            </Button>
          </>
        }
      >
        <Field label="Reason">
          <Textarea />
        </Field>
        <p>Say why, so it can be fixed or dropped. The reason is kept with the requirement.</p>
      </Dialog>
      <ConfirmDialog
        open={open === 'confirm'}
        onClose={close}
        title="Delete E-Commerce Portal v2?"
        confirmLabel="Delete forever"
        variant="danger-fill"
        onConfirm={close}
        typed={{ label: 'Project name', value: 'E-Commerce Portal v2' }}
      >
        26 requirements, 41 test cases, 12 runs and 15 defects will be deleted for everyone. Type
        the project name to confirm.
      </ConfirmDialog>
      <Sheet open={open === 'sheet'} onClose={close} title="More">
        {['Reports', 'Members', 'Activity log', 'Project settings'].map((link) => (
          <a key={link} href="#overlays" className="flex min-h-12 items-center text-body text-text">
            {link}
          </a>
        ))}
      </Sheet>
    </div>
  );
}
