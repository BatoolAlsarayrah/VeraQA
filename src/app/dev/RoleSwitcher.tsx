import { LinkButton } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { Select } from '@/components/ui/Select';
import { homePath, roleLabels, setCurrentProject } from '@/lib';
import type { Role, Session } from '@/types';

import { setRole } from './mock';

const roles = Object.keys(roleLabels) as Role[];

function isRole(value: string): value is Role {
  return roles.some((role) => role === value);
}

export function RoleSwitcher({ session }: { session: Session }) {
  return (
    <Panel title={`${session.user.name}’s role in each project`} list>
      <ul className="divide-y divide-border">
        {session.memberships.map((membership) => (
          <li
            key={membership.projectId}
            className="flex flex-wrap items-end justify-between gap-4 px-4 py-4 tablet:px-6"
          >
            <Field label={membership.projectName} className="min-w-50 flex-1">
              <Select
                value={membership.role}
                onChange={(event) => {
                  const role = event.target.value;
                  if (isRole(role)) setRole(membership.projectId, session.user.id, role);
                }}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </Select>
            </Field>
            <LinkButton
              to={homePath(membership.projectId, membership.capabilities)}
              onClick={() => setCurrentProject(membership.projectId)}
            >
              Open project
            </LinkButton>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
