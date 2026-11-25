# VeraQA API (frontend contract)

This file lists every endpoint the VeraQA frontend calls: method, path, request, response, errors and the screen that uses it. It is kept in sync with each feature's `api.ts`, so the backend team can build against it.

The frontend never implements backend or AI logic. With `VITE_API_MODE=mock` it runs against an in-browser mock of these endpoints; with `VITE_API_MODE=live` it calls `VITE_API_BASE_URL` with no code changes.

## Conventions

- Every path starts with `/api`, on the host in `VITE_API_BASE_URL`. Requests send the session cookie (`credentials: 'include'`).
- JSON request and response bodies with `camelCase` keys, except the SRS upload, which is `multipart/form-data`.
- Lists come wrapped as `{ "items": [...] }`, so paging can be added later without changing the shape.
- Times are ISO 8601 in UTC (`2026-11-25T10:58:00.000Z`). Days without a time are `2026-12-20`.
- Fixed sets of values are lowercase kebab-case: `pending-review`, `in-progress`, `not-run`, `wrong-input`. The frontend turns them into the labels people see.
- Item IDs are the human IDs shown in the UI and are unique per project: `REQ-014`, `SC-007`, `TC-031`, `BUG-007`, and run numbers such as `12`. The prefixes `REQ`, `SC`, `TC` and `BUG` are fixed for every project: Project settings shows them, but they can't be changed.
- `projectId` and person IDs are opaque strings. The frontend never parses them; the mock uses readable slugs such as `e-commerce-portal-v2` and `batool-hani`.
- The frontend checks every response against its schema. A response that doesn't match shows an error page naming the endpoint and the field, so contract drift is caught straight away instead of breaking a screen quietly.

### Errors

Every error is a non-2xx status with this body:

```json
{
  "error": {
    "code": "validation",
    "message": "Check the highlighted fields, then try again.",
    "fields": { "reason": "Write a reason before you reject it." }
  }
}
```

- `code` is a short machine-readable string, such as `validation`, `forbidden`, `not_found`, `conflict` or `invalid_credentials`.
- `message` is shown to people as written. Say what happened, then what to do, in plain sentences with no exclamation marks.
- `fields` appears only for validation errors (`422`) and maps a request field to the message shown under it.
- `401` means there's no valid session. The frontend clears what it holds and goes to Sign in. Sign-in itself answers wrong details with `422 invalid_credentials`, not `401`.
- `403` means the person's role doesn't allow the action. Data a role must not see is left out of responses rather than refused.
- `404` shows the Not found page.

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
