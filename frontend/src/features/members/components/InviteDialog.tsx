import { Button, Dialog, Field, FormError, Input, Select } from '@/components/ui';
import { useApiForm } from '@/hooks';
import { roleLabels } from '@/lib';
import { InviteRole } from '@/types';

import { invite } from '../api';
import { InviteForm } from '../types';

const hints: Record<InviteRole, string> = {
  'qa-lead': 'QA leads coordinate the work and approve requirements and AI drafts.',
  'qa-engineer': 'QA engineers review, run tests and report defects. They can’t approve AI drafts.',
  developer: 'Developers fix the defects assigned to them, and see only those defects.',
};

const roles: InviteRole[] = ['qa-engineer', 'qa-lead', 'developer'];

type Props = {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onSent: (emails: string[]) => void;
  cancelLabel?: string;
};

export function InviteDialog({ projectId, open, onClose, onSent, cancelLabel = 'Cancel' }: Props) {
  const { form, onSubmit, error, busy } = useApiForm({
    schema: InviteForm,
    defaultValues: { emails: '', role: 'qa-engineer' },
    submit: async (values) => {
      await invite(projectId, values);
      return values.emails;
    },
    onSuccess: (emails) => {
      form.reset();
      onSent(emails);
    },
  });
  const { errors } = form.formState;
  const role = InviteRole.safeParse(form.watch('role')).data ?? 'qa-engineer';

  return (
    <Dialog open={open} onClose={onClose} title="Invite people" size="sm">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormError message={error} />
        <Field label="Email addresses" error={errors.emails?.message}>
          <Input
            type="text"
            inputMode="email"
            autoComplete="off"
            spellCheck={false}
            placeholder="name@company.com"
            {...form.register('emails')}
          />
        </Field>
        <Field label="Role" help={hints[role]}>
          <Select {...form.register('role')}>
            {roles.map((value) => (
              <option key={value} value={value}>
                {roleLabels[value]}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button type="submit" variant="primary" loading={busy}>
            Send invites
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
