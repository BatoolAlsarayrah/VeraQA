# VeraQA API (frontend contract)

This file lists every endpoint the VeraQA frontend calls: method, path, request, response, errors and the screen that uses it. It is kept in sync with each feature's `api.ts`, so the backend team can build against it.

The frontend never implements backend or AI logic. With `VITE_API_MODE=mock` it runs against an in-browser mock of these endpoints; with `VITE_API_MODE=live` it calls `VITE_API_BASE_URL` with no code changes.

## Conventions

- JSON request and response bodies, `camelCase` keys.
- Item IDs are the human IDs shown in the UI and are unique per project: `REQ-014`, `SC-007`, `TC-031`, `BUG-007`, and run numbers such as `12`.
- `projectId` is an opaque string. The frontend never parses it; the mock uses readable slugs such as `e-commerce-portal-v2`.
- Errors: a non-2xx status with `{ "message": string }`. The message is shown to the person, so it should say what happened and what to do.

## Permissions

The frontend never decides permissions from a role name. It shows or hides each action from the `capabilities` array the API sends for the current project, and the backend enforces every permission on its side.

| Capability  | Lets the person                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `workspace` | Open the dashboard, My work, requirements, test scenarios, test cases and test runs                                              |
| `upload`    | Add requirements (upload an SRS or type them in) and start an AI analysis                                                        |
| `approve`   | Approve or reject requirements, scenarios and test cases, set priority, bulk-approve, and start scenario or test-case generation |
| `edit`      | Edit drafts                                                                                                                      |
| `test`      | Run tests, record results, report defects and retest                                                                             |
| `trace`     | Open traceability and follow trace links                                                                                         |
| `manage`    | Open reports, members, the activity log and project settings; create test runs and assign work                                   |
| `owner`     | Use the danger zone: change the project manager, delete the project                                                              |
| `fix`       | Start fixing a defect assigned to them, mark it fixed or mark it invalid                                                         |

Everyone in a project can open Defects (developers see only the defects assigned to them), Search, Notifications and their account.

The mock assigns these per role:

| Role            | Capabilities                                                                        |
| --------------- | ----------------------------------------------------------------------------------- |
| Project manager | `workspace`, `upload`, `approve`, `edit`, `test`, `trace`, `manage`, `owner`, `fix` |
| QA lead         | `workspace`, `upload`, `approve`, `edit`, `test`, `trace`, `manage`                 |
| QA engineer     | `workspace`, `edit`, `test`, `trace`                                                |
| Developer       | `fix`                                                                               |

## Endpoints

### Session (planned)

Used by the whole app shell. Until the mock API lands, the frontend uses a built-in stand-in with this shape.

`GET /session`

Response `200`:

```json
{
  "user": { "name": "Batool Hani", "email": "batool.hani@shop-team.com" },
  "memberships": [
    {
      "projectId": "e-commerce-portal-v2",
      "projectName": "E-Commerce Portal v2",
      "role": "qa-lead",
      "capabilities": ["workspace", "upload", "approve", "edit", "test", "trace", "manage"]
    }
  ],
  "currentProjectId": "e-commerce-portal-v2"
}
```

- `role` is one of `project-manager`, `qa-lead`, `qa-engineer`, `developer`. It is shown as a label only.
- Errors: `401` when not signed in (the frontend goes to Sign in).

## Open questions for the backend

1. **Should the project manager get `fix`?** Resolved: yes. The project manager holds every permission, so in a solo project they can take a defect through its whole lifecycle. A developer still acts only on defects assigned to them, and so does a project manager acting with `fix`.
