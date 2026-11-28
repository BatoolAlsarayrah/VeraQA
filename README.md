# VeraQA

VeraQA is an AI-supported web system for software quality assurance. A team uploads an SRS or types in its requirements, and the AI flags ambiguous, missing or contradictory requirements and drafts test scenarios and test cases. Everything stays an AI draft until a QA lead or project manager approves it. Testers then run the approved test cases by hand, record results and report defects, and every defect traces back to the requirement it broke. This repository is the React frontend. The PHP backend, MySQL database and n8n workflows are built separately.

## Stack

- Vite, React 19 and strict TypeScript
- React Router (data router), TanStack Query, React Hook Form and Zod, with Zod schemas checking every API response
- MSW for the in-browser mock API, and Recharts for charts
- Tailwind CSS v4, reading the design tokens as CSS variables, with light and dark themes
- IBM Plex Sans and JetBrains Mono, self-hosted with Fontsource
- Vitest, React Testing Library and jsdom
- ESLint (typescript-eslint, react-hooks, react-refresh, jsx-a11y, simple-import-sort) and Prettier with the Tailwind plugin

## Setup

Requires Node 24 (see `.nvmrc`; Node 22.12 or later works).

```bash
nvm use
npm install
cp .env.example .env
npm run dev
```

| Variable            | Values                                                            |
| ------------------- | ----------------------------------------------------------------- |
| `VITE_API_MODE`     | `mock` uses the in-browser mock API, `live` uses the real backend |
| `VITE_API_BASE_URL` | The backend URL when `VITE_API_MODE=live`, without `/api`         |

To run against the real backend, see [Connecting the frontend](API.md#connecting-the-frontend) in `API.md`, which also lists the cookie and CORS settings the server needs.

## Demo accounts

These accounts exist only in the mock API (`VITE_API_MODE=mock`). They are demo data for the mock only: the password works nowhere else. Every account uses the password `VeraQA#2026`.

| Person         | Email                          | E-Commerce Portal v2 | Clinic booking app | Payments API    | Library system  | Mobile banking app     |
| -------------- | ------------------------------ | -------------------- | ------------------ | --------------- | --------------- | ---------------------- |
| Batool Hani    | `batool.hani@shop-team.com`    | QA lead              | QA engineer        | Developer       | Project manager | Invited as QA engineer |
| Batool Mahmoud | `batool.mahmoud@shop-team.com` | QA engineer          | QA lead            | QA lead         |                 |                        |
| Qays Kaled     | `qays.kaled@shop-team.com`     | Developer            | Developer          | Developer       |                 |                        |
| Lina Saeed     | `lina.saeed@shop-team.com`     | Developer            | Project manager    |                 |                 | Project manager        |
| Maria Ayman    | `maria.ayman@shop-team.com`    | Project manager      |                    | Project manager |                 |                        |

The mock starts signed in as Batool Hani. Its data lives in the browser's localStorage until it's reset.

## Scripts

| Command                | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Starts the dev server                         |
| `npm run build`        | Typechecks, then builds to `dist/`            |
| `npm run preview`      | Serves the production build                   |
| `npm run lint`         | Runs ESLint                                   |
| `npm run typecheck`    | Runs the TypeScript compiler without emitting |
| `npm run test`         | Runs the unit tests once                      |
| `npm run test:watch`   | Runs the unit tests in watch mode             |
| `npm run format`       | Formats the code with Prettier                |
| `npm run format:check` | Checks formatting without changing files      |

## Folder map

```
src/
  app/          App entry, router and providers
  assets/       Logo
  components/
    ui/         Generic primitives (Button, Input, Dialog…)
    layout/     App shell, sidebar, top bar, phone header and tab bar
    domain/     QA-specific shared pieces (Logo, status badges, chain strip…)
  features/     One folder per area, each with pages/ (and components/ once needed):
                auth, projects, dashboard, my-work, notifications, search,
                account, requirements, scenarios, test-cases, runs, defects,
                traceability, members, reports, activity, settings
  hooks/        Shared hooks (useTheme…)
  lib/          Shared utilities (cn…)
  mocks/        Mock API handlers and seed data
  styles/       tokens.css, globals.css, motion.css
  types/        Shared domain types
  test/         Test helpers
```

Import from `src/` with the `@/` alias, for example `import { Logo } from '@/components/domain'`.

## Themes and breakpoints

The theme is `data-theme="light"` or `"dark"` on `<html>`. A first visit follows the OS setting, and the choice is saved in `localStorage` once the person picks one.

Breakpoints are mobile-first: phone styles take no prefix, `tablet:` starts at 901px, `desktop:` at 1101px and `wide:` at 1600px.
