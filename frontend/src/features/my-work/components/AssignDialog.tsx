import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { z } from 'zod';

import {
  Button,
  Dialog,
  Field,
  FormError,
  Input,
  Select,
  TabPanel,
  Tabs,
  useToast,
} from '@/components/ui';
import { useApiForm } from '@/hooks';

import { assign, membersQuery, type Pickable } from '../api';
import { PickList } from './PickList';

const tabs: { id: Pickable['type']; label: string }[] = [
  { id: 'requirement', label: 'Requirements' },
  { id: 'scenario', label: 'Scenarios' },
  { id: 'test-case', label: 'Test cases' },
  { id: 'defect', label: 'Defects' },
];

const AssignForm = z.object({
  assigneeId: z.string().min(1, 'Choose who gets the work.'),
  due: z.string().transform((value) => value || null),
});

type Props = { projectId: string; open: boolean; onClose: () => void };

export function AssignDialog({ projectId, open, onClose }: Props) {
  const toast = useToast();
  const [tab, setTab] = useState<Pickable['type']>('requirement');
  const [picked, setPicked] = useState(new Map<string, Pickable>());
  const members = useQuery({ ...membersQuery(projectId), enabled: open });
  const needs = new Set([...picked.values()].map((item) => item.needs));
  const people = (members.data ?? []).filter(
    (member) =>
      member.status !== 'invited' && [...needs].every((need) => member.capabilities.includes(need)),
  );

  const { form, onSubmit, error, busy } = useApiForm({
    schema: AssignForm,
    defaultValues: { assigneeId: '', due: '' },
    submit: async (values) => {
      const items = [...picked.values()].map(({ type, id }) => ({ type, id }));
      await assign(projectId, { items, ...values });
      return values.assigneeId;
    },
    onSuccess: (assigneeId) => {
      const name = people.find((member) => member.id === assigneeId)?.name ?? 'them';
      toast(`Assigned to ${name}`);
      setPicked(new Map());
      form.reset();
      onClose();
    },
  });
  const { errors } = form.formState;

  function toggle(item: Pickable) {
    const next = new Map(picked);
    const key = `${item.type}:${item.id}`;
    if (next.delete(key)) {
      setPicked(next);
      return;
    }
    setPicked(next.set(key, item));
    const chosen = people.find((member) => member.id === form.getValues('assigneeId'));
    if (chosen && !chosen.capabilities.includes(item.needs)) form.setValue('assigneeId', '');
  }

  return (
    <Dialog open={open} onClose={onClose} title="Assign work">
      <p>Pick items and give them to someone on the team. They get a notification.</p>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormError message={error} />
        <Tabs
          name="assign"
          label="Item type"
          tabs={tabs}
          value={tab}
          onChange={setTab}
          className="tablet:self-start"
        />
        <TabPanel name="assign" id={tab}>
          <PickList projectId={projectId} type={tab} picked={picked} onToggle={toggle} />
        </TabPanel>
        <div className="grid gap-4 tablet:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Field label="Assign to" error={errors.assigneeId?.message}>
            <Select {...form.register('assigneeId')}>
              <option value="">Choose a person</option>
              {people.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Due date" optional>
            <Input type="date" {...form.register('due')} />
          </Field>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={busy} disabled={picked.size === 0}>
            {`Assign ${String(picked.size)} ${picked.size === 1 ? 'item' : 'items'}`}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
