import { useState } from 'react';

import {
  Checkbox,
  ChoiceCard,
  Field,
  FormError,
  Input,
  PasswordInput,
  Segmented,
  Select,
  Switch,
  Textarea,
} from '@/components/ui';

export function Fields() {
  const [mode, setMode] = useState<'upload' | 'write'>('upload');

  return (
    <div className="grid gap-5 desktop:grid-cols-2">
      <Field label="Project name" help="Shown to everyone on the project.">
        <Input placeholder="E-Commerce Portal v2" />
      </Field>
      <Field label="Target date" optional>
        <Input placeholder="20 December" />
      </Field>
      <Field label="Project name" error="The name is empty. Type a name for the project.">
        <Input />
      </Field>
      <Field label="Password" help="At least 8 characters, with a number.">
        <PasswordInput autoComplete="new-password" />
      </Field>
      <FormError message="That email and password don’t match. Check them, or reset your password." />
      <Field label="Test run">
        <Select defaultValue="">
          <option value="" disabled>
            Choose a test run
          </option>
          <option value="12">Run 12 · Sprint 4 regression</option>
          <option value="11">Run 11 · Sprint 3 regression</option>
        </Select>
      </Field>
      <Field label="Requirements" help="One requirement per line.">
        <Textarea placeholder="The system shall…" />
      </Field>
      <div className="flex flex-col gap-3">
        <Checkbox label="Include closed defects" />
        <Checkbox label="Notify me when a retest passes" defaultChecked />
        <Segmented
          name="input"
          label="How to add requirements"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'upload', label: 'Upload SRS' },
            { value: 'write', label: 'Write them in' },
          ]}
        />
      </div>
      <div className="flex flex-col gap-4">
        <Switch label="Allow bulk approval" description="Approve several items at once." />
        <Switch label="Email me a daily summary" defaultChecked />
        <Switch
          label="Notify on reopened defects"
          description="Developers always hear when their defect comes back."
          locked
        />
      </div>
      <fieldset className="grid grid-cols-1 content-start gap-2 tablet:grid-cols-2">
        <legend className="mb-1.5 text-label">How will you work?</legend>
        <ChoiceCard
          name="mode"
          value="solo"
          title="On my own"
          caption="Only you on the project"
          defaultChecked
        />
        <ChoiceCard name="mode" value="team" title="With a team" caption="Invite people later" />
      </fieldset>
    </div>
  );
}
