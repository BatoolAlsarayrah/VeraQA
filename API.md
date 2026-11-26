# VeraQA API (frontend contract)

This file lists every endpoint the VeraQA frontend calls: method, path, request, response, errors and the screen that uses it. It is kept in sync with each feature's `api.ts`, so the backend team can build against it.

The frontend never implements backend or AI logic. With `VITE_API_MODE=mock` it runs against an in-browser mock of these endpoints; with `VITE_API_MODE=live` it calls `VITE_API_BASE_URL` with no code changes.

The mock in `src/mocks/` implements every endpoint below, including the permission rules, the defect lifecycle and the AI jobs (with canned drafts). It's a working reference for how each endpoint should behave, and a test checks that this file and the mock list the same endpoints. Its demo accounts are listed in the README.

## Endpoints at a glance

**Core** endpoints are what the frontend needs for its main flows; build these first. **Later** endpoints are used by the frontend too (it runs on all of them through the mock), but their screens can wait. `{p}` is the `projectId`. The sections under [Endpoints](#endpoints) describe each one in full.

| Area             | Method and path                                             | Tag   |
| ---------------- | ----------------------------------------------------------- | ----- |
| Session          | `GET /session`                                              | Core  |
| Session          | `POST /auth/sign-in`                                        | Core  |
| Session          | `POST /auth/register`                                       | Core  |
| Session          | `POST /auth/forgot-password`                                | Core  |
| Session          | `POST /auth/sign-out`                                       | Core  |
| Account          | `PATCH /account/profile`                                    | Later |
| Account          | `POST /account/password`                                    | Later |
| Account          | `GET /account/notification-settings`                        | Later |
| Account          | `PUT /account/notification-settings`                        | Later |
| Projects         | `GET /projects`                                             | Core  |
| Projects         | `POST /projects`                                            | Core  |
| Projects         | `GET /projects/{p}/counts`                                  | Core  |
| Invitations      | `GET /invitations`                                          | Later |
| Invitations      | `POST /invitations/{id}/accept`                             | Later |
| Invitations      | `POST /invitations/{id}/decline`                            | Later |
| Project settings | `GET /projects/{p}/settings`                                | Later |
| Project settings | `PATCH /projects/{p}/settings`                              | Later |
| Project settings | `POST /projects/{p}/transfer`                               | Later |
| Project settings | `DELETE /projects/{p}`                                      | Later |
| Members          | `GET /projects/{p}/members`                                 | Core  |
| Members          | `POST /projects/{p}/invitations`                            | Later |
| Members          | `PATCH /projects/{p}/members/{memberId}`                    | Later |
| Notifications    | `GET /notifications`                                        | Core  |
| Notifications    | `POST /notifications/{id}/read`                             | Core  |
| Notifications    | `POST /notifications/read-all`                              | Core  |
| Requirements     | `GET /projects/{p}/requirements`                            | Core  |
| Requirements     | `GET /projects/{p}/requirements/{id}`                       | Core  |
| Requirements     | `POST /projects/{p}/srs`                                    | Core  |
| Requirements     | `POST /projects/{p}/requirements/typed`                     | Core  |
| Requirements     | `POST /projects/{p}/requirements/{id}/approve`              | Core  |
| Requirements     | `POST /projects/{p}/requirements/{id}/reject`               | Core  |
| Requirements     | `PATCH /projects/{p}/requirements/{id}`                     | Core  |
| Requirements     | `PATCH /projects/{p}/requirements/{id}/priority`            | Core  |
| Requirements     | `POST /projects/{p}/requirements/{id}/accept-rewrite`       | Later |
| Requirements     | `POST /projects/{p}/requirements/{id}/return-to-review`     | Later |
| Requirements     | `POST /projects/{p}/requirements/approve-all`               | Later |
| Requirements     | `POST /projects/{p}/requirements/{id}/findings/{n}/resolve` | Later |
| Jobs             | `GET /jobs/{jobId}`                                         | Core  |
| Jobs             | `GET /projects/{p}/jobs?active=true`                        | Core  |
| Jobs             | `POST /jobs/{jobId}/cancel`                                 | Later |
| Scenarios        | `GET /projects/{p}/scenarios`                               | Core  |
| Scenarios        | `GET /projects/{p}/scenarios/{id}`                          | Core  |
| Scenarios        | `PATCH /projects/{p}/scenarios/{id}`                        | Core  |
| Scenarios        | `POST /projects/{p}/scenarios/{id}/approve`                 | Core  |
| Scenarios        | `POST /projects/{p}/scenarios/{id}/reject`                  | Core  |
| Scenarios        | `POST /projects/{p}/scenarios/generate`                     | Core  |
| Scenarios        | `PATCH /projects/{p}/scenarios/{id}/priority`               | Later |
| Scenarios        | `POST /projects/{p}/scenarios/approve-all`                  | Later |
| Test cases       | `GET /projects/{p}/test-cases`                              | Core  |
| Test cases       | `GET /projects/{p}/test-cases/{id}`                         | Core  |
| Test cases       | `PATCH /projects/{p}/test-cases/{id}`                       | Core  |
| Test cases       | `POST /projects/{p}/test-cases/{id}/approve`                | Core  |
| Test cases       | `POST /projects/{p}/test-cases/{id}/reject`                 | Core  |
| Test cases       | `POST /projects/{p}/test-cases/generate`                    | Core  |
| Test cases       | `PATCH /projects/{p}/test-cases/{id}/priority`              | Later |
| Test cases       | `POST /projects/{p}/test-cases/approve-all`                 | Later |
| Runs             | `GET /projects/{p}/runs`                                    | Core  |
| Runs             | `POST /projects/{p}/runs`                                   | Core  |
| Runs             | `GET /projects/{p}/runs/{run}`                              | Core  |
| Runs             | `GET /projects/{p}/runs/{run}/tests/{tc}`                   | Core  |
| Runs             | `PUT /projects/{p}/runs/{run}/tests/{tc}/result`            | Core  |
| Runs             | `PATCH /projects/{p}/runs/{run}`                            | Later |
| Runs             | `PATCH /projects/{p}/runs/{run}/entries/{tc}`               | Later |
| Runs             | `POST /projects/{p}/runs/{run}/tests/{tc}/evidence`         | Later |
| Defects          | `GET /projects/{p}/defects`                                 | Core  |
| Defects          | `GET /projects/{p}/defects/{id}`                            | Core  |
| Defects          | `POST /projects/{p}/defects`                                | Core  |
| Defects          | `POST /projects/{p}/defects/{id}/start-fixing`              | Core  |
| Defects          | `POST /projects/{p}/defects/{id}/mark-fixed`                | Core  |
| Defects          | `POST /projects/{p}/defects/{id}/mark-invalid`              | Core  |
| Defects          | `POST /projects/{p}/defects/{id}/start-retest`              | Core  |
| Defects          | `POST /projects/{p}/defects/{id}/retest`                    | Core  |
| Defects          | `POST /projects/{p}/defects/{id}/reopen`                    | Core  |
| Defects          | `POST /projects/{p}/defects/{id}/assign`                    | Later |
| Dashboard        | `GET /projects/{p}/dashboard`                               | Core  |
| My work          | `GET /projects/{p}/my-work`                                 | Core  |
| My work          | `POST /projects/{p}/assignments`                            | Later |
| Traceability     | `GET /projects/{p}/traceability`                            | Later |
| Reports          | `GET /projects/{p}/reports`                                 | Later |
| Reports          | `GET /projects/{p}/reports/export.csv`                      | Later |
| Activity         | `GET /projects/{p}/activity`                                | Later |
| Search           | `GET /projects/{p}/search`                                  | Later |

## Conventions

- Every path starts with `/api`, on the host in `VITE_API_BASE_URL`. Requests send the session cookie (`credentials: 'include'`).
- JSON request and response bodies with `camelCase` keys, except the SRS upload, which is `multipart/form-data`.
- Lists come wrapped as `{ "items": [...] }`, so paging can be added later without changing the shape.
- Times are ISO 8601 in UTC (`2026-11-25T10:58:00.000Z`). Days without a time are `2026-12-20`.
- Fixed sets of values are lowercase kebab-case: `pending-review`, `in-progress`, `not-run`, `wrong-input`. The frontend turns them into the labels people see.
- Item IDs are the human IDs shown in the UI and are unique per project: `REQ-014`, `SC-007`, `TC-031`, `BUG-007`, and run numbers such as `12`. The prefixes `REQ`, `SC`, `TC` and `BUG` are fixed for every project: Project settings shows them, but they can't be changed.
- `projectId` and person IDs are opaque strings. The frontend never parses them; the mock uses readable slugs such as `e-commerce-portal-v2` and `batool-hani`.
- The frontend checks every response against its schema. A response that doesn't match shows an error page naming the endpoint and the field, so contract drift is caught straight away instead of breaking a screen quietly.

### Editing approved items

The two rules differ on purpose, and the backend should apply them exactly as below:

- **Approved requirements can't be edited directly.** Someone with `approve` first returns the requirement to review, then it can be edited and approved again. Changing a requirement's wording changes what is being tested, so the change gets a fresh review.
- **Approved scenarios and test cases can be edited by someone with `approve`, and they stay approved.** These edits complete the details of something already agreed, such as adding the test data a generation asked for. A QA engineer (`edit` without `approve`) can edit drafts only.

In both cases AI output never overwrites an approved item, and editing a rejected item sends it back to Pending review.

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

Each endpoint lists its tag, who may call it (a capability, "any member" of the project, or "signed in"), the request, the response, its errors, and the screen that uses it. `{p}` is the `projectId`. Every endpoint can also answer `401` (no session) as described under Errors; it isn't repeated below.

### Session and sign-in

#### `GET /session` · Core

Signed in. Used by every screen: it tells the frontend who the person is and what they may do in each project.

Response `200`:

```json
{
  "user": { "id": "batool-hani", "name": "Batool Hani", "email": "batool.hani@shop-team.com" },
  "memberships": [
    {
      "projectId": "e-commerce-portal-v2",
      "projectName": "E-Commerce Portal v2",
      "role": "qa-lead",
      "capabilities": ["workspace", "upload", "approve", "edit", "test", "trace", "manage"]
    }
  ]
}
```

- `role` is one of `project-manager`, `qa-lead`, `qa-engineer`, `developer`, and is shown as a label only. The frontend decides what to show from `capabilities`.
- The project someone last opened is kept by the frontend, not the API.

#### `POST /auth/sign-in` · Core

Anyone. Sign in screen.

Request: `{ "email": "batool.hani@shop-team.com", "password": "…" }`. Response `200`: the same body as `GET /session`, and the session cookie is set.

Errors: `422 invalid_credentials` when the email and password don't match ("That email and password don't match. Check them, or reset your password."). Never `401`, which would send the person back to Sign in. `422 validation` for an empty field.

#### `POST /auth/register` · Core

Anyone. Create your account screen. Register doesn't ask for a role: whoever creates a project later becomes its project manager.

Request: `{ "firstName": "Omar", "lastName": "Saleh", "email": "omar@uni.edu", "password": "…" }`. The password has at least 8 characters, with a number.

Response `201`: a session with no memberships, and the person is signed in.

Errors: `422 validation`, with `fields.email` when the email already has an account ("An account with this email already exists. Sign in instead.").

#### `POST /auth/forgot-password` · Core

Anyone. Reset your password screen.

Request: `{ "email": "…" }`. Response `202` with no body, whether or not the email has an account, so the answer doesn't reveal who is registered.

#### `POST /auth/sign-out` · Core

Signed in. The account menu. Response `204`, and the session cookie is cleared.

### Account

#### `PATCH /account/profile` · Later

Signed in. Account settings, Profile.

Request: `{ "firstName", "lastName", "email" }`. Response `200`: the user (`{ "id", "name", "email" }`).

Errors: `422 validation` with `fields.email` when another account uses the email.

#### `POST /account/password` · Later

Signed in. Account settings, Password.

Request: `{ "current": "…", "next": "…" }`. Response `204`.

Errors: `422 validation` with `fields.current` ("That isn't your current password.") or `fields.next` (at least 8 characters, with a number).

#### `GET /account/notification-settings` and `PUT /account/notification-settings` · Later

Signed in. Account settings, Email me when.

Body (both the `PUT` request and both responses): `{ "email": { "defect-assigned": true, "run-started": false } }`. Keys are `analysis-ready`, `test-failed`, `defect-reopened`, `member-joined`, `defect-assigned`, `fix-failed-retest`, `fix-closed`, `tests-assigned`, `retest-ready`, `review-decision` and `run-started`. A key that's left out keeps the server's default. People always see notifications in the app; these switches add email.

### Projects

#### `GET /projects` · Core

Signed in. Your projects screen.

Response `200`: `{ "items": [Project] }`, only the projects the person is a member of.

```json
{
  "id": "e-commerce-portal-v2",
  "name": "E-Commerce Portal v2",
  "description": "Web shop rebuild: accounts, cart, checkout and payments",
  "role": "qa-lead",
  "stage": "reviewing-requirements",
  "solo": false
}
```

`stage` is one of `getting-started`, `reviewing-requirements`, `designing-tests`, `running-tests`, `fixing-defects`, `closing-defects`, shown as a short status on the project card.

#### `POST /projects` · Core

Signed in. Create project dialog on Your projects.

Request: `{ "name": "Thesis tools", "description": "…", "team": "solo" }`, where `team` is `solo` or `team`. Response `201`: the new `Project`. The creator becomes its project manager.

Errors: `422 validation` with `fields.name` ("Give the project a name.").

#### `GET /projects/{p}/counts` · Core

Any member. The sidebar, the phone tab bar and the More sheet.

Response `200`: `{ "myWork": 9, "pendingReview": 5, "openDefects": 7 }`.

- `myWork` counts what is waiting on this person: requirements and AI drafts assigned to them for review, their not-run tests in active runs, their blocked tests that are ready to run again, defects waiting for their retest, and (with `fix`) defects assigned to them that still need fixing.
- `pendingReview` counts requirements in Pending review, or `0` without `workspace`.
- `openDefects` counts defects that aren't Closed or Invalid. A developer counts only the defects assigned to them.

Errors: `404` when the project doesn't exist or the person isn't a member.

### Invitations

#### `GET /invitations` · Later

Signed in. Your projects, the invitation cards.

Response `200`: `{ "items": [Invitation] }`, the invitations sent to the person's email.

```json
{
  "id": "inv-mobile-banking",
  "project": { "id": "mobile-banking-app", "name": "Mobile banking app", "description": "…" },
  "role": "qa-engineer",
  "invitedBy": { "id": "lina-saeed", "name": "Lina Saeed" },
  "at": "2026-11-25T08:00:00.000Z"
}
```

#### `POST /invitations/{id}/accept` and `POST /invitations/{id}/decline` · Later

Signed in, and the invitation was sent to their email. Your projects.

Accept answers `200` with the joined `Project`, and notifies the person who invited them. Decline answers `204`.

Errors: `404` for an invitation that doesn't exist or isn't theirs.

### Project settings

#### `GET /projects/{p}/settings` · Later

`manage`. Project settings.

```json
{
  "name": "E-Commerce Portal v2",
  "description": "…",
  "targetDate": "2026-12-20",
  "prefixes": { "requirement": "REQ", "scenario": "SC", "testCase": "TC", "defect": "BUG" },
  "environments": ["Staging, Chrome 130", "Staging, Firefox 132"],
  "rules": { "bulkApproval": true, "rejectReason": true, "engineersReportDefects": true },
  "ai": {
    "flagVague": true,
    "flagMissing": true,
    "flagContradictions": true,
    "suggestRewrites": true
  },
  "language": "en",
  "projectManager": { "id": "maria-ayman", "name": "Maria Ayman" }
}
```

- `prefixes` are fixed and shown read-only.
- The two rules that are always on (AI output stays a draft until approved, and a defect is retested before it closes) aren't settings, so they aren't in `rules`.
- `language` is `en` or `ar`, the language of AI suggestions and test steps.

#### `PATCH /projects/{p}/settings` · Later

`manage`. Project settings, Save changes.

Request: any of `name`, `description`, `targetDate`, `environments`, `rules`, `ai`, `language`. `prefixes` and `projectManager` can't be changed here. Response `200`: the full settings.

#### `POST /projects/{p}/transfer` · Later

`owner`. Project settings, Danger zone, Change project manager.

Request: `{ "memberId": "batool-mahmoud" }`. Response `204`. The chosen member becomes project manager, and the person who made the change stays on as a QA lead.

Errors: `422 validation` with `fields.memberId` when the member isn't in the project or is the person themselves.

#### `DELETE /projects/{p}` · Later

`owner`. Project settings, Danger zone, Delete project.

Request: `{ "confirmName": "E-Commerce Portal v2" }`. Response `204`. Every requirement, test, result, defect and notification in the project is removed for everyone.

Errors: `422 validation` with `fields.confirmName` when the name isn't typed exactly.

### Members

#### `GET /projects/{p}/members` · Core

`workspace`. Members, and every assignee picker (assign work, run assignees, the developer on a defect report).

Response `200`: `{ "items": [Member] }`. Everyone with `workspace` gets names and roles; with `manage`, each member also has `email`, `status` and `workload`, and pending invitations are listed with `status: "invited"`.

```json
{
  "id": "batool-hani",
  "name": "Batool Hani",
  "role": "qa-lead",
  "email": "batool.hani@shop-team.com",
  "status": "active",
  "workload": { "assigned": 19, "done": 11, "unit": "items" }
}
```

`workload.unit` is `defects` for developers (defects assigned, and how many are fixed or closed) and `items` for everyone else (tests in active runs and items to review, and how many are done).

#### `POST /projects/{p}/invitations` · Later

`manage`. Members, Invite people.

Request: `{ "emails": ["name@company.com"], "role": "qa-engineer" }`. `role` is `qa-lead`, `qa-engineer` or `developer`; nobody is invited as project manager. Response `204`.

Errors: `422 validation` with `fields.emails` when an address is invalid or already in the project.

#### `PATCH /projects/{p}/members/{memberId}` · Later

`manage`. Members, the role picker on each row.

Request: `{ "role": "qa-lead" }`. Response `204`.

Errors: `409 conflict` for the project manager (changed only through Change project manager) or for the person's own role.

### Notifications

Notifications belong to a person and are tagged with a project. The bell and the Notifications page show the current project's.

#### `GET /notifications` · Core

Signed in. The bell, the phone notifications sheet and the Notifications page.

Query: `projectId` (optional) and `unread=true` (optional). Response `200`: `{ "items": [Notification] }`, newest first.

```json
{
  "id": "note-1",
  "projectId": "e-commerce-portal-v2",
  "title": "Qays Kaled marked BUG-007 as fixed",
  "detail": "Off-by-one in the attempt counter. Waiting for Batool Mahmoud to retest.",
  "at": "2026-11-25T10:53:00.000Z",
  "unread": true,
  "actor": { "type": "person", "id": "qays-kaled", "name": "Qays Kaled" },
  "target": { "type": "defect", "id": "BUG-007" }
}
```

- `actor` is a person or `{ "type": "ai" }`.
- `target` says what the notification opens: `requirement`, `requirements`, `scenario`, `scenarios`, `test-case`, `test-cases`, `run`, `defect`, `my-work`, `members`, or a finished AI job (`analysis`, `scenario-generation` or `test-case-generation`, with the job ID), with the item's ID where there is one. The frontend turns it into a link.

Errors: `404` when `projectId` is a project the person isn't in.

#### `POST /notifications/{id}/read` · Core

Signed in. Opening a notification. Response `204`. Errors: `404` for a notification that isn't the person's.

#### `POST /notifications/read-all` · Core

Signed in. Notifications, Mark all as read. Query: `projectId` (optional) limits it to one project. Response `204`.

### Requirements

A requirement has a short `title`, used on every screen, and the `text` quoted from the SRS ("The system shall…"). Its review status is `pending-review`, `approved` or `rejected`. AI output stays a draft until someone with `approve` approves it, and approved requirements are never overwritten by AI output.

#### `GET /projects/{p}/requirements` · Core

`workspace`. Requirements (the review list) and the requirement pickers.

Query, all optional: `status` (`pending-review`, `approved` or `rejected`), `search` (matches the ID, title or text, ignoring case) and `assignee` (a person ID, or `me`).

Response `200`: `{ "items": [RequirementSummary] }`, in ID order.

```json
{
  "id": "REQ-015",
  "title": "Reset the password at any time",
  "text": "Users shall be able to reset their password at any time.",
  "section": "Authentication",
  "status": "pending-review",
  "priority": null,
  "openFindings": 3,
  "assignee": { "id": "batool-hani", "name": "Batool Hani" }
}
```

`priority` is `critical`, `high`, `medium`, `low` or `null` (not set yet).

#### `GET /projects/{p}/requirements/{id}` · Core

`workspace`. The requirement detail panel.

Response `200`: the summary fields plus:

```json
{
  "type": "functional",
  "origin": "ai",
  "confidence": 0.86,
  "source": { "file": "SRS_v2.pdf", "section": "Authentication", "page": 7 },
  "findings": [
    {
      "n": 3,
      "kind": "contradiction",
      "text": "REQ-014 locks the account for 15 minutes, but a reset at any time would defeat the lockout.",
      "related": "REQ-014",
      "resolved": false
    }
  ],
  "rewrite": {
    "text": "Users shall be able to reset their password through an emailed link that stays valid for 1 hour, except during an active lockout."
  },
  "rejectionReason": null,
  "decidedBy": null,
  "decidedAt": null,
  "scenarios": [
    { "id": "SC-007", "title": "Lock on the 5th failed login in a row", "status": "approved" }
  ],
  "history": [{ "at": "…", "actor": { "type": "ai" }, "action": "drafted", "note": null }]
}
```

- `type` is `functional` or `non-functional`. `origin` is `ai` (split out by the analysis) or `person` (typed in). `confidence` is the AI's confidence from 0 to 1, or `null` for a person's.
- `source.file` is `null` for requirements typed in by hand.
- `findings[].kind` is `ambiguous`, `missing-information` or `contradiction`. `related` points at the other requirement in a contradiction.
- `history[].action` is `created`, `drafted`, `edited`, `approved`, `rejected`, `returned-to-review`, `priority-set`, `rewrite-accepted` or `finding-resolved`.

Errors: `404` for an ID that doesn't exist in the project.

#### `POST /projects/{p}/srs` · Core

`upload`. Add requirements, Upload SRS.

Request: `multipart/form-data` with one or more `files` fields. Each file is PDF, DOCX or TXT, up to 10 MB; the files are analyzed together. Response `202`: `{ "jobId": "…" }` for an [analysis job](#jobs).

Errors:

- `422 validation` with `fields.files` for a missing file, a wrong type ("SRS.png: Use a PDF, DOCX or TXT file.") or a file over 10 MB.
- `409 conflict` while another analysis is running in the project.

#### `POST /projects/{p}/requirements/typed` · Core

`upload`. Add requirements, Write them in.

Request: `{ "text": "…" }`, one requirement per line. Numbering and bullets are ignored. Response `202`: `{ "jobId": "…" }` for an analysis job, which splits and checks the lines like an uploaded SRS.

Errors: `422 validation` with `fields.text` when it's empty, and `409 conflict` as above.

#### Reviewing: approve, reject and return to review

All need `approve` and answer `200` with the full requirement. Requirements, the detail panel.

- `POST /projects/{p}/requirements/{id}/approve` · Core. `409` if it's already approved.
- `POST /projects/{p}/requirements/{id}/reject` · Core. Request: `{ "reason": "Duplicate of REQ-017." }`; the reason is required and kept with the requirement. `409` if it's already rejected, or if approved scenarios are built on it.
- `POST /projects/{p}/requirements/{id}/return-to-review` · Later. Used by Undo after an approve or reject. `409` if approved scenarios are built on it.
- `POST /projects/{p}/requirements/approve-all` · Later. Approves every requirement in Pending review that has no open findings. Response `200`: `{ "approved": ["REQ-012", "REQ-020"] }`.

#### `PATCH /projects/{p}/requirements/{id}` · Core

`edit`. The detail panel, Edit.

Request: `{ "title", "text", "section", "type" }`. Response `200`: the full requirement. Editing a rejected requirement sends it back to Pending review.

Errors: `409` for an approved requirement ("Return it to review before you edit it.").

#### `PATCH /projects/{p}/requirements/{id}/priority` · Core

`approve`. Request: `{ "priority": "high" }`. Response `200`: the full requirement.

#### `POST /projects/{p}/requirements/{id}/accept-rewrite` · Later

`approve`. The detail panel, Accept rewrite. Replaces the text with the suggested rewrite and resolves the findings. Response `200`: the full requirement.

Errors: `409` when there's no suggestion, or the requirement is approved.

#### `POST /projects/{p}/requirements/{id}/findings/{n}/resolve` · Later

`approve`. Marks one finding as resolved without changing the text. Response `200`: the full requirement. Errors: `404` for a finding that doesn't exist.

### Test scenarios

A scenario belongs to one approved requirement. Like requirements, it has a review status (`pending-review`, `approved`, `rejected`), and AI drafts stay drafts until someone with `approve` approves them. Only approved scenarios move on to test cases.

#### `GET /projects/{p}/scenarios` · Core

`workspace`. Test scenarios (grouped by requirement in the UI).

Query, all optional: `status`, `requirement` (a requirement ID) and `search` (ID or title). Response `200`: `{ "items": [ScenarioSummary] }`.

```json
{
  "id": "SC-007",
  "title": "Lock on the 5th failed login in a row",
  "type": "negative",
  "priority": "high",
  "status": "approved",
  "origin": "ai",
  "requirement": {
    "id": "REQ-014",
    "title": "Lock the account for 15 minutes after 5 failed logins"
  },
  "testCases": [
    {
      "id": "TC-031",
      "title": "Lock the account after 5 consecutive failed logins",
      "status": "approved",
      "lastResult": "failed"
    }
  ]
}
```

`type` is `positive` or `negative`. `lastResult` is the most recently recorded result in any run (`not-run`, `passed`, `failed` or `blocked`), separate from the review status.

#### `GET /projects/{p}/scenarios/{id}` · Core

`workspace`. Scenario detail. Response `200`: the summary fields plus `description`, `precondition` (or `null`), `testData` (`[{ "label": "Email", "value": "test.user@shop.com" }]`), `rejectionReason` and `history` (as for requirements). Errors: `404`.

#### `PATCH /projects/{p}/scenarios/{id}` · Core

`edit`. Scenario detail, Edit.

Request: `{ "title", "description", "precondition", "type", "testData" }`. Response `200`: the full scenario.

- A QA engineer can edit drafts. An approved scenario can be edited only with `approve` (for example to add the test data generation asked for), and it stays approved.
- Editing a rejected scenario sends it back to Pending review.

Errors: `409` when someone without `approve` edits an approved scenario.

#### `POST /projects/{p}/scenarios/{id}/approve` and `…/reject` · Core

`approve`. Test scenarios and scenario detail. Reject takes `{ "reason": "…" }` (required). Both answer `200` with the full scenario.

Errors: `409` when it's already in that state, or (for reject) when approved test cases are built on it.

#### `PATCH /projects/{p}/scenarios/{id}/priority` · Later

`approve`. Request: `{ "priority": "high" }`. Response `200`: the full scenario.

#### `POST /projects/{p}/scenarios/approve-all` · Later

`approve`. Test scenarios, Approve all pending. Response `200`: `{ "approved": ["SC-004", "SC-009"] }`.

#### `POST /projects/{p}/scenarios/generate` · Core

`approve`. Requirements, "Generate scenarios from 21 approved". Starts a `scenario-generation` [job](#jobs) for the approved requirements that have no scenarios yet. Response `202`: `{ "jobId": "…" }`.

While it runs, the job also has `items`, one per requirement it reads, for the progress page ("9 of 21 requirements read"):

```json
{
  "id": "REQ-014",
  "title": "Lock the account for 15 minutes after 5 failed logins",
  "progress": "running",
  "drafted": 0
}
```

`progress` is `waiting`, `running` or `done`, and `drafted` counts the scenarios drafted for it so far. When the job is done, `result` is:

```json
{
  "drafted": 9,
  "read": 21,
  "covered": 19,
  "tooVague": [
    {
      "requirement": { "id": "REQ-021", "title": "Be easy to use" },
      "reason": "Too vague to test. Say what “easy” means in a way someone can check."
    }
  ],
  "groups": [
    {
      "requirement": {
        "id": "REQ-014",
        "title": "Lock the account for 15 minutes after 5 failed logins"
      },
      "scenarios": [
        { "id": "SC-007", "title": "Lock on the 5th failed login in a row", "type": "negative" }
      ]
    }
  ]
}
```

The drafts are saved as AI drafts in Pending review, and the person who started the job is notified ("9 scenario drafts are ready for review").

Errors: `409` when every approved requirement already has scenarios, or while another scenario generation is running in the project.

### Test cases

A test case belongs to one approved scenario. It carries a review status and, separately, its last result. Only approved test cases can be added to a run.

#### `GET /projects/{p}/test-cases` · Core

`workspace`. Test cases (grouped by scenario in the UI).

Query, all optional: `status`, `result` (the last result), `scenario` (a scenario ID) and `search` (ID or title). Response `200`: `{ "items": [TestCaseSummary] }`.

```json
{
  "id": "TC-031",
  "title": "Lock the account after 5 consecutive failed logins",
  "type": "limit",
  "priority": "high",
  "status": "approved",
  "origin": "ai",
  "lastResult": "failed",
  "scenario": { "id": "SC-007", "title": "Lock on the 5th failed login in a row" },
  "assignee": { "id": "batool-mahmoud", "name": "Batool Mahmoud" }
}
```

`type` is `normal`, `wrong-input` or `limit`. `assignee` is who runs it in the current active run, if anyone.

#### `GET /projects/{p}/test-cases/{id}` · Core

`workspace`. Test case detail, along the line back to its requirement.

Response `200`: the summary fields plus:

```json
{
  "requirement": {
    "id": "REQ-014",
    "title": "Lock the account for 15 minutes after 5 failed logins"
  },
  "precondition": "An active account exists.",
  "testData": [{ "label": "Email", "value": "test.user@shop.com" }],
  "steps": [
    {
      "n": 3,
      "action": "Sign in with the wrong password a 5th time.",
      "expected": "the account locks for 15 minutes."
    }
  ],
  "runs": [
    { "number": 12, "name": "Sprint 4 regression", "result": "failed", "failedStep": 3, "at": "…" }
  ],
  "defects": [
    {
      "id": "BUG-007",
      "title": "Account locks after 6 failed attempts instead of 5",
      "status": "fixed"
    }
  ],
  "rejectionReason": null,
  "history": []
}
```

`runs` lists every run the test case is in, newest first; `failedStep` is the step that failed or was blocked. Errors: `404`.

#### `PATCH /projects/{p}/test-cases/{id}` · Core

`edit`. Test case detail, Edit.

Request: `{ "title", "type", "precondition", "testData", "steps": [{ "action", "expected" }] }`, with at least one step. The steps are numbered in order. Response `200`: the full test case.

The same editing rules as scenarios apply. Errors: `409` when someone without `approve` edits an approved test case, and `422` with `fields.steps` when there are no steps.

#### `POST /projects/{p}/test-cases/{id}/approve` and `…/reject` · Core

`approve`. Reject takes `{ "reason": "…" }`. Both answer `200` with the full test case.

Errors: `409` when it's already in that state, or (for reject) when it already has results in a run.

#### `PATCH /projects/{p}/test-cases/{id}/priority` · Later

`approve`. Request: `{ "priority": "high" }`. Response `200`: the full test case.

#### `POST /projects/{p}/test-cases/approve-all` · Later

`approve`. Response `200`: `{ "approved": ["TC-045"] }`.

#### `POST /projects/{p}/test-cases/generate` · Core

`approve`. Test scenarios, "Generate test cases from 7 approved". Starts a `test-case-generation` [job](#jobs) for the approved scenarios that have no test cases yet. Response `202`: `{ "jobId": "…" }`.

Its `items` are the scenarios it reads, with the same `progress` and `drafted` fields. When done, `result` is:

```json
{
  "drafted": 35,
  "read": 7,
  "covered": 6,
  "needsTestData": [
    {
      "scenario": { "id": "SC-002", "title": "Refuse an email that is already registered" },
      "reason": "The AI needs an account that's already registered to test against. Add it as test data, then generate again."
    }
  ],
  "groups": [
    {
      "scenario": { "id": "SC-007", "title": "Lock on the 5th failed login in a row" },
      "testCases": [
        {
          "id": "TC-031",
          "title": "Lock the account after 5 consecutive failed logins",
          "type": "limit"
        }
      ]
    }
  ]
}
```

Each drafted test case has numbered steps, an expected result for each step, and the scenario's test data. Errors: `409` when every approved scenario already has test cases, or while another test-case generation is running.

### Test runs

A run is a set of approved test cases run by hand in one environment, named like "Run 12 · Sprint 4 regression". Each test case in a run is an entry with its own assignee and result.

#### `GET /projects/{p}/runs` · Core

`workspace`. Test runs. Response `200`: `{ "items": [RunSummary] }`, newest first.

```json
{
  "number": 12,
  "name": "Sprint 4 regression",
  "environment": "Staging, Chrome 130",
  "status": "active",
  "startedAt": "…",
  "closedAt": null,
  "counts": { "passed": 18, "failed": 3, "blocked": 1, "notRun": 12 }
}
```

#### `POST /projects/{p}/runs` · Core

`manage`. New test run.

Request:

```json
{
  "name": "Sprint 5 regression",
  "environment": "Staging, Chrome 130",
  "entries": [{ "testCaseId": "TC-031", "assigneeId": "batool-mahmoud" }]
}
```

`assigneeId` may be `null`. Response `201`: the full run. The run gets the next number in the project, and each assignee is notified of their test cases.

Errors: `422 validation` with `fields["entries.0.testCaseId"]` for a test case that isn't approved, or `fields["entries.0.assigneeId"]` for someone who can't run tests.

#### `GET /projects/{p}/runs/{run}` · Core

`workspace`. Run detail. Response `200`: the summary plus `entries`:

```json
{
  "testCase": { "id": "TC-040", "title": "Pay with a valid Visa card" },
  "scenario": { "id": "SC-010", "title": "Pay for an order by credit card" },
  "assignee": { "id": "batool-hani", "name": "Batool Hani" },
  "result": "blocked",
  "blocked": {
    "step": 2,
    "reason": "blocked-by-defect",
    "details": "Card payment fails for Visa numbers with spaces.",
    "defect": {
      "id": "BUG-003",
      "title": "Card payment fails for Visa numbers with spaces",
      "status": "reopened"
    }
  },
  "readyToRunAgain": false
}
```

`readyToRunAgain` turns `true` when the defect that blocked the test is closed. The test then shows under "Ready to run again" in My work, until it's run again.

#### `PATCH /projects/{p}/runs/{run}` · Later

`manage`. Close a run: request `{ "status": "closed" }`. Response `200`: the run. Errors: `409` when it's already closed.

#### `PATCH /projects/{p}/runs/{run}/entries/{tc}` · Later

`manage`. Reassign one test: request `{ "assigneeId": "batool-hani" }` (or `null`). Response `200`: the run. Errors: `409` for a closed run, `422` for someone who can't run tests.

#### `GET /projects/{p}/runs/{run}/tests/{tc}` · Core

`test`. Run a test.

```json
{
  "run": { "number": 12, "name": "Sprint 4 regression", "environment": "Staging, Chrome 130" },
  "testCase": { "id": "TC-031", "title": "…", "precondition": "…", "testData": [], "steps": [] },
  "scenario": { "id": "SC-007", "title": "…" },
  "requirement": { "id": "REQ-014", "title": "…" },
  "assignee": { "id": "batool-mahmoud", "name": "Batool Mahmoud" },
  "result": "failed",
  "environment": "Staging, Chrome 130",
  "steps": [
    { "n": 3, "result": "failed", "actual": "The account stayed active after the 5th attempt." }
  ],
  "blocked": null,
  "evidence": [{ "id": "…", "name": "TC-031-step-3.png", "size": 253952, "type": "image/png" }],
  "defect": { "id": "BUG-007", "title": "…", "status": "fixed" },
  "environments": ["Staging, Chrome 130", "Staging, Firefox 132"],
  "recordedBy": { "id": "batool-mahmoud", "name": "Batool Mahmoud" },
  "recordedAt": "…"
}
```

`steps` holds the recorded result of each step (empty until the test is run). `defect` is the defect reported from this test in this run, if any. `environments` lists the project's environments to choose from.

#### `PUT /projects/{p}/runs/{run}/tests/{tc}/result` · Core

`test`. Run a test, Save result.

```json
{
  "environment": "Staging, Chrome 130",
  "steps": [
    { "n": 1, "result": "passed", "actual": null },
    { "n": 2, "result": "blocked", "actual": null },
    { "n": 3, "result": "not-run", "actual": null }
  ],
  "blocked": { "reason": "blocked-by-defect", "details": "…", "defectId": "BUG-003" }
}
```

- There's a result for every step. A failed step needs `actual` (what happened instead).
- **Blocked means the test couldn't be run, not that it failed.** A blocked step needs `blocked` with a `reason`: `environment-down`, `test-data-missing`, `blocked-by-defect`, `depends-on-test` or `other`. `blocked-by-defect` also needs `defectId` (report a new defect first if there isn't one). The steps after a blocked step are `not-run`.
- The test's result is `failed` if any step failed, `blocked` if one is blocked, and `passed` only if every step passed.

Response `200`: the Run a test view.

Errors:

- `422 validation`, with `fields.steps` when a step is missing or the test isn't finished, `fields.blocked` when the reason is missing, and `fields["blocked.defectId"]` for a defect that doesn't exist or is already closed.
- `409` for a closed run.

#### `POST /projects/{p}/runs/{run}/tests/{tc}/evidence` · Later

`test`. Run a test, Evidence. Request: `multipart/form-data` with one `file`, a PNG or JPG image up to 10 MB. Response `201`: the attachment (`{ "id", "name", "size", "type" }`). Errors: `422 validation` with `fields.file`, and `409` for a closed run.

### Defects

A defect follows a fixed lifecycle:

| From              | Action                        | Who                            | To          |
| ----------------- | ----------------------------- | ------------------------------ | ----------- |
| Open, Reopened    | `start-fixing`                | the assigned developer (`fix`) | In progress |
| In progress       | `mark-fixed`, with a fix note | the assigned developer         | Fixed       |
| Open, In progress | `mark-invalid`, with a reason | the assigned developer         | Invalid     |
| Fixed             | `start-retest`                | `test`                         | Retest      |
| Retest            | `retest` passed               | `test`                         | Closed      |
| Retest            | `retest` failed, with a note  | `test`                         | Reopened    |
| Closed, Invalid   | `reopen`, with a note         | `test`                         | Reopened    |

`fix` actions are only for the defect's assignee, even for a project manager, who also holds `fix`. Every role sees the full report; fix notes and invalid reasons appear in Developer notes, and every retest is kept.

#### `GET /projects/{p}/defects` · Core

Any member. Defects (the board) and Your defects. Developers (`fix` without `workspace`) only get the defects assigned to them.

Query, all optional: `status`, `severity`, `assignee` (a person ID or `me`) and `search` (ID or title). Response `200`: `{ "items": [DefectSummary] }`.

```json
{
  "id": "BUG-007",
  "title": "Account locks after 6 failed attempts instead of 5",
  "severity": "high",
  "status": "fixed",
  "assignee": { "id": "qays-kaled", "name": "Qays Kaled" },
  "reporter": { "id": "batool-mahmoud", "name": "Batool Mahmoud" },
  "testCase": { "id": "TC-031", "title": "Lock the account after 5 consecutive failed logins" },
  "reportedAt": "…",
  "updatedAt": "…"
}
```

`status` is `open`, `in-progress`, `fixed`, `retest`, `closed`, `reopened` or `invalid`.

#### `GET /projects/{p}/defects/{id}` · Core

Any member who can see the defect. Defect detail.

Response `200`: the summary plus:

```json
{
  "steps": ["Open the sign-in page.", "Sign in with the wrong password 4 times."],
  "expected": "The account locks for 15 minutes.",
  "actual": "The account stays active. It locks only after the 6th attempt.",
  "environment": "Staging, Chrome 130",
  "evidence": [],
  "source": {
    "run": { "number": 12, "name": "Sprint 4 regression" },
    "testCase": { "id": "TC-031", "title": "…" },
    "step": 3
  },
  "trace": {
    "scenario": { "id": "SC-007", "title": "…" },
    "requirement": { "id": "REQ-014", "title": "…" }
  },
  "notes": [
    {
      "kind": "fix",
      "author": { "id": "qays-kaled", "name": "Qays Kaled" },
      "text": "Off-by-one in the attempt counter.",
      "at": "…"
    }
  ],
  "retests": [
    { "n": 1, "outcome": "failed", "by": { "id": "…", "name": "…" }, "note": "…", "at": "…" }
  ],
  "history": [
    {
      "at": "…",
      "actor": { "id": "…", "name": "…" },
      "action": "marked-fixed",
      "status": "fixed",
      "note": "…"
    }
  ],
  "waitingOn": { "id": "batool-mahmoud", "name": "Batool Mahmoud" }
}
```

- `source` is where the defect was found (`null` if it was reported outside a run). Developers see it too.
- `trace` is the chain back to the requirement. It's `null` without the `trace` capability, so developers never get it.
- `waitingOn` names who the next step waits on: the assignee while it's Open, In progress or Reopened; the reporter while it's Fixed or Invalid; whoever started the retest while it's in Retest; nobody once it's Closed.
- `history[].action` is `reported`, `assigned`, `started-fixing`, `marked-fixed`, `marked-invalid`, `started-retest`, `retest-passed`, `retest-failed` or `reopened`.

Errors: `404` for a defect that doesn't exist, or that a developer isn't assigned to.

#### `POST /projects/{p}/defects` · Core

`test`. Run a test, Report defect.

```json
{
  "title": "Account locks after 6 failed attempts instead of 5",
  "severity": "high",
  "assigneeId": "qays-kaled",
  "steps": ["Open the sign-in page.", "…"],
  "expected": "…",
  "actual": "…",
  "environment": "Staging, Chrome 130",
  "source": { "run": 12, "testCaseId": "TC-031", "step": 3 }
}
```

`source` may be `null`. Response `201`: the full defect, Open, with the next `BUG-` number and the evidence from the test it came from. The developer is notified.

Errors: `422 validation` with `fields.assigneeId` for someone who can't fix defects, or `fields.source` for a test that isn't in that run. `403` for a QA engineer when Project settings has turned off "QA engineers can report defects".

#### Lifecycle actions · Core

`POST /projects/{p}/defects/{id}/{action}`, where the action is one of the following:

- `start-fixing`: no body.
- `mark-fixed`: `{ "note": "…" }`.
- `mark-invalid`: `{ "reason": "…" }`.
- `start-retest`: no body.
- `retest`: `{ "outcome": "passed" }` or `{ "outcome": "failed", "note": "…" }`.
- `reopen`: `{ "note": "…" }`.

Each answers `200` with the full defect and notifies the person the defect now waits on. When a retest passes, every test the defect blocked becomes ready to run again, and its tester is notified ("BUG-003 is closed. TC-040 can be run again.").

Errors:

- `403` when the role lacks the capability, or for a `fix` action by someone who isn't the assignee ("BUG-012 is assigned to Lina Saeed, so only Lina Saeed can do that.").
- `409` when the defect's status doesn't allow the action ("BUG-007 is Fixed, so it can't be marked as invalid now.").
- `422 validation` for a missing note or reason.

#### `POST /projects/{p}/defects/{id}/assign` · Later

`manage`. Defect detail, Assign. Request: `{ "assigneeId": "qays-kaled" }`. Response `200`: the full defect; the new developer is notified.

Errors: `422` for someone who can't fix defects, and `409` for a defect that's Fixed, in Retest, Closed or Invalid.

### Dashboard

#### `GET /projects/{p}/dashboard` · Core

`workspace`. Dashboard.

```json
{
  "targetDate": "2026-12-20",
  "stages": {
    "srs": { "files": 2 },
    "requirements": { "total": 26, "approved": 21, "pending": 5 },
    "scenarios": { "total": 13, "approved": 11, "pending": 2 },
    "testCases": { "total": 35, "approved": 34, "pending": 1 },
    "run": { "number": 12, "name": "Sprint 4 regression", "total": 34, "ran": 22 },
    "defects": { "open": 7, "critical": 1 }
  },
  "attention": [
    { "kind": "review-requirements", "count": 5, "item": null, "run": null, "defect": null },
    {
      "kind": "blocked-test",
      "count": null,
      "item": { "type": "test-case", "id": "TC-040", "title": "Pay with a valid Visa card" },
      "run": { "number": 12, "name": "Sprint 4 regression" },
      "defect": { "id": "BUG-003", "title": "…", "status": "reopened" }
    }
  ],
  "run": {
    "number": 12,
    "name": "Sprint 4 regression",
    "counts": { "passed": 18, "failed": 3, "blocked": 1, "notRun": 12 }
  },
  "defects": { "critical": 1, "high": 3, "medium": 2, "low": 1 },
  "activity": []
}
```

- **The current run** (`stages.run` and `run`) is the active run with the most tests.
- **`attention`** lists what needs someone, in this order:
  - with `approve`: counts of requirements, scenarios and test cases in Pending review (`review-requirements`, `approve-scenarios`, `approve-test-cases`)
  - `run-tests`: the person's own tests not yet run
  - `failed-test` and `blocked-test`: each failed or blocked test in the current run, with the defect reported from it or blocking it
  - `retest`: each Fixed defect waiting for a retest, with its test case
- **The counts:** `defects` counts open defects by severity. `activity` has the four latest [activity entries](#activity-log).

### My work

#### `GET /projects/{p}/my-work` · Core

`workspace`. My work. Response `200`: `{ "groups": [WorkGroup] }`. Empty groups are left out, and the total number of items equals `myWork` in `GET /projects/{p}/counts`.

```json
{
  "kind": "tests-to-run",
  "items": [
    {
      "item": {
        "type": "test-case",
        "id": "TC-032",
        "title": "Reset the failed-attempt count after a successful sign-in"
      },
      "due": "2026-11-26",
      "run": { "number": 12, "name": "Sprint 4 regression" },
      "assignedBy": null,
      "openFindings": null,
      "draftedFor": null,
      "blockedBy": null,
      "fixedBy": null,
      "retest": null
    }
  ]
}
```

| `kind`                   | Items                                                                             | Extra fields                                      |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------- |
| `requirements-to-review` | Requirements in Pending review assigned to the person                             | `due`, `openFindings`                             |
| `drafts-to-approve`      | Scenarios and test cases in Pending review assigned to the person                 | `due`, `draftedFor` (its requirement or scenario) |
| `tests-to-run`           | The person's not-run tests in active runs                                         | `due`, `run`                                      |
| `ready-to-run-again`     | The person's blocked tests whose blocking defect closed                           | `run`, `blockedBy`                                |
| `retests`                | Fixed defects, or defects in Retest, waiting on the person                        | `fixedBy`, `retest` (the test case to run again)  |
| `defects-to-fix`         | With `fix`: defects assigned to the person that are Open, In progress or Reopened | none                                              |

#### `POST /projects/{p}/assignments` · Later

`manage`. My work, Assign work.

```json
{
  "items": [
    { "type": "requirement", "id": "REQ-023" },
    { "type": "defect", "id": "BUG-012" }
  ],
  "assigneeId": "maria-ayman",
  "due": "2026-12-01"
}
```

`type` is `requirement`, `scenario`, `test-case` or `defect`, and `due` may be `null`. Response `204`; the assignee is notified.

Errors: `422 validation` when an item doesn't exist, an item in Pending review goes to someone without `approve`, a defect goes to someone without `fix`, or a defect is already past fixing.

### Traceability

#### `GET /projects/{p}/traceability` · Later

`trace`. Traceability. Developers never get it.

Response `200`:

```json
{
  "requirements": [
    {
      "id": "REQ-014",
      "title": "Lock the account for 15 minutes after 5 failed logins",
      "text": "The system shall lock the account for 15 minutes after 5 consecutive failed logins.",
      "scenarios": [
        {
          "id": "SC-007",
          "title": "…",
          "status": "approved",
          "testCases": [
            {
              "id": "TC-031",
              "title": "…",
              "status": "approved",
              "lastResult": "failed",
              "defects": [{ "id": "BUG-007", "title": "…", "status": "fixed" }]
            }
          ]
        }
      ]
    }
  ],
  "gaps": {
    "failedOrBlocked": [
      {
        "id": "TC-040",
        "title": "…",
        "result": "blocked",
        "blockedBy": { "id": "BUG-003", "title": "…", "status": "reopened" }
      }
    ],
    "scenariosWithoutTests": [
      { "id": "SC-002", "title": "Refuse an email that is already registered" }
    ],
    "notRun": [{ "id": "TC-046", "title": "…" }],
    "pendingRequirements": 5
  }
}
```

- `requirements` holds approved requirements only; pending ones can't be traced until they're approved.
- **`gaps`:**
  - `failedOrBlocked`: approved test cases whose last result is Failed or Blocked
  - `scenariosWithoutTests`: approved scenarios with no test cases
  - `notRun`: approved test cases never run, or whose last result is Not run
  - `pendingRequirements`: how many requirements are still waiting for review

### Reports

#### `GET /projects/{p}/reports` · Later

`manage`. Reports. Query: `period` is `sprint` (the default: active runs), `30d` (runs started in the last 30 days) or `all`; it only changes `runs`.

```json
{
  "period": "sprint",
  "requirements": { "total": 26, "approved": 21, "pending": 5 },
  "scenarioCoverage": { "covered": 7, "total": 21 },
  "testCaseCoverage": { "covered": 7, "total": 21 },
  "passRate": { "run": 12, "passed": 18, "ran": 22, "total": 34 },
  "openDefects": { "critical": 1, "high": 3, "medium": 2, "low": 1 },
  "runs": [{ "number": 12, "passed": 18, "failed": 3, "blocked": 1, "notRun": 12 }],
  "coverage": [
    {
      "requirement": { "id": "REQ-014", "title": "…" },
      "scenarios": 2,
      "testCases": 5,
      "passed": 4,
      "openDefects": 1
    }
  ],
  "ai": { "accepted": 34, "edited": 12, "rejected": 6 },
  "workload": [
    {
      "person": { "id": "batool-hani", "name": "Batool Hani" },
      "role": "qa-lead",
      "done": 11,
      "total": 19
    }
  ]
}
```

- **Coverage:** `scenarioCoverage` and `testCaseCoverage` count approved requirements that have at least one approved scenario or test case.
- **Pass rate:** `passRate` covers the current run and counts only tests that were run (`passed` out of `ran`).
- **The coverage table:** `coverage` has one row per approved requirement. `passed` counts its approved test cases whose last result is Passed, and `openDefects` counts the open defects reported from them.
- **AI drafts:** `ai` counts what reviewers did with the AI's drafts:
  - accepted: approved with no edits
  - edited: approved after an edit or an accepted rewrite
  - rejected
- **Workload:** `workload` matches each member's workload on the Members screen.

#### `GET /projects/{p}/reports/export.csv` · Later

`manage`. Reports, Download CSV. Response `200` with `Content-Type: text/csv` and `Content-Disposition: attachment; filename="{projectId}-coverage.csv"`, holding the coverage table:

```
Requirement,Title,Scenarios,Test cases,Passed,Open defects
REQ-014,Lock the account for 15 minutes after 5 failed logins,2,5,4,1
```

### Activity log

#### `GET /projects/{p}/activity` · Later

`manage`. Activity log, and the dashboard's recent activity. Query, all optional: `person` (a person ID, or `ai`) and `type`. Response `200`: `{ "items": [ActivityEntry] }`, newest first.

```json
{
  "id": "act-1",
  "at": "…",
  "actor": { "type": "person", "id": "qays-kaled", "name": "Qays Kaled" },
  "type": "defects",
  "action": "marked-fixed",
  "item": {
    "type": "defect",
    "id": "BUG-007",
    "title": "Account locks after 6 failed attempts instead of 5"
  },
  "count": null
}
```

- **`type`, the filter:** `srs`, `requirements`, `scenarios`, `test-cases`, `runs`, `defects`, `invalid`, `blocked` or `ai`.
- **`action`, what happened:**
  - files and AI: `uploaded`, `analyzed`, `flagged`, `drafted`
  - review: `approved`, `rejected`, `edited`
  - runs: `started-run`, `passed`, `failed`, `blocked`
  - defects: `reported`, `started-fixing`, `marked-fixed`, `marked-invalid`, `retest-passed`, `retest-failed`, `reopened`
  - members: `joined`
- `item.type` may also be `file` (an uploaded SRS) or `run`. `count` is set when one entry covers several items ("drafted 3 scenarios for REQ-014", "flagged 8 issues in SRS_v2.pdf").

### Search

#### `GET /projects/{p}/search` · Later

Any member. Search, and the search field in the top bar.

Query, all optional:

- `q`: matches the ID or title, and a requirement's text.
- `type`: `requirement`, `scenario`, `test-case` or `defect`.
- `priority`: severity for defects.
- `status` and `assignee`: a person ID or `me`.

Response `200`: `{ "items": [SearchResult] }`.

```json
{
  "item": {
    "type": "test-case",
    "id": "TC-031",
    "title": "Lock the account after 5 consecutive failed logins"
  },
  "status": "failed",
  "priority": "high",
  "assignee": { "id": "batool-mahmoud", "name": "Batool Mahmoud" }
}
```

`status` is the review status for requirements, scenarios and test cases still in review, the last result for approved test cases, and the defect status for defects. Developers only find the defects assigned to them.

### Jobs

AI work (SRS analysis, scenario generation and test-case generation) runs as a background job through n8n and the LLM. Starting one answers `202` with `{ "jobId": "…" }`; the frontend then polls `GET /jobs/{jobId}` until the status is `done`, `failed` or `cancelled`. A job keeps running if the person leaves the page; the analysis banner finds it again with `GET /projects/{p}/jobs?active=true`. When a job finishes, the backend adds its drafts (as AI drafts in Pending review) and notifies the person who started it.

```json
{
  "id": "job-…",
  "projectId": "e-commerce-portal-v2",
  "kind": "analysis",
  "status": "running",
  "step": 1,
  "steps": [
    { "label": "Reading 2 files", "detail": "22 pages, 4,870 words", "status": "done" },
    { "label": "Splitting them into requirements", "detail": null, "status": "running" },
    { "label": "Checking each one", "detail": null, "status": "waiting" },
    { "label": "Drafting suggested rewrites", "detail": null, "status": "waiting" }
  ],
  "progress": 0.35,
  "startedAt": "…",
  "finishedAt": null,
  "error": null,
  "files": ["SRS_v2.pdf", "NFR_addendum.docx"],
  "result": null
}
```

- `status` is `queued`, `running`, `done`, `failed` or `cancelled`. `step` is the index of the current step, and `progress` runs from 0 to 1.
- A step's `detail` is filled in once it's done. Its `status` is `waiting`, `running` or `done`.
- `error` is `{ "code", "message" }` when the job failed, written for people like any other error.
- `result` is `null` until the job is done. Its shape depends on `kind`:
  - `analysis` also has `files` (the uploaded file names, empty for typed requirements), and its result is `{ "requirements", "sections", "ambiguous", "missingInformation", "contradictions", "rewrites" }`, all counts.
  - `scenario-generation` and `test-case-generation` also have `items` and are described with their endpoints, under Test scenarios and Test cases.

#### `GET /jobs/{jobId}` · Core

`workspace` in the job's project. The analysis page, the generation pages and the analysis banner. Response `200`: the job. Errors: `404` for a job that doesn't exist or isn't visible to the person.

#### `GET /projects/{p}/jobs` · Core with `active=true`

`workspace`. The analysis banner on every project page. Query: `active=true` lists only queued and running jobs. Response `200`: `{ "items": [Job] }`, newest first.

#### `POST /jobs/{jobId}/cancel` · Later

The person who started it, or anyone who could start one (`upload` for an analysis, `approve` for generation). The generation pages, Cancel. Response `200`: the job, now `cancelled`; nothing it drafted is kept.

Errors: `409` when the job already finished.

## Open questions for the backend

1. **Should the project manager get `fix`?** Resolved: yes. The project manager holds every permission, so in a solo project they can take a defect through its whole lifecycle. A developer still acts only on defects assigned to them, and so does a project manager acting with `fix`.
2. **Cookie session or bearer token?** The frontend assumes a cookie session: every request is sent with `credentials: 'include'`, and sign-in sets the cookie. If the backend issues a bearer token instead, only `lib/api-client.ts` changes, to store the token and send an `Authorization` header.
3. **Paging.** Lists come back whole for now, wrapped as `{ "items": [...] }`. If a project grows too large, the plan is to add `cursor` and `limit` query params and a `nextCursor` next to `items`, which doesn't break the current shape.
4. **Report PDFs.** Reports offers Download CSV from the API. Download PDF currently uses the browser's print dialog on the Reports page. If the backend would rather render the PDF, a `GET /projects/{p}/reports/export.pdf` with the same `period` query would slot in next to the CSV export.
