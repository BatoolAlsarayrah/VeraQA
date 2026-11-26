import { Button, ChoiceCard, Dialog, Field, FormError, Input, Textarea } from '@/components/ui';
import { useApiForm } from '@/hooks';
import { type Project, ProjectInput } from '@/types';

import { createProject } from '../api';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (project: Project, team: boolean) => void;
};

export function CreateProjectDialog({ open, onClose, onCreated }: Props) {
  const { form, onSubmit, error, busy } = useApiForm({
    schema: ProjectInput,
    defaultValues: { name: '', description: '', team: 'solo' },
    submit: createProject,
    onSuccess: (project, values) => {
      form.reset();
      onCreated(project, values.team === 'team');
    },
  });
  const { errors } = form.formState;

  return (
    <Dialog open={open} onClose={onClose} title="Create project" size="sm">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormError message={error} />
        <Field label="Project name" error={errors.name?.message}>
          <Input placeholder="Mobile banking app" {...form.register('name')} />
        </Field>
        <Field label="Description" optional error={errors.description?.message}>
          <Textarea
            rows={2}
            placeholder="What is being tested, in one line"
            {...form.register('description')}
          />
        </Field>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-label text-text">Who works on it?</legend>
          <div className="grid grid-cols-2 gap-2">
            <ChoiceCard
              title="Just me"
              caption="You hold every permission."
              value="solo"
              {...form.register('team')}
            />
            <ChoiceCard
              title="A team"
              caption="Invite people after you create it."
              value="team"
              {...form.register('team')}
            />
          </div>
        </fieldset>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={busy}>
            Create project
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
