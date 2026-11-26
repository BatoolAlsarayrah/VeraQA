import {
  data,
  type LoaderFunctionArgs,
  type Params,
  redirect,
  type RouteObject,
} from 'react-router';

import { AccountPage } from '@/features/account';
import { ActivityPage } from '@/features/activity';
import { ForgotPasswordPage, RegisterPage, SignInPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { DefectPage, DefectsPage } from '@/features/defects';
import { MembersPage } from '@/features/members';
import { MyWorkPage } from '@/features/my-work';
import { NotificationsPage } from '@/features/notifications';
import { ProjectsPage } from '@/features/projects';
import { ReportsPage } from '@/features/reports';
import {
  AddRequirementsPage,
  AnalysisPage,
  RequirementPage,
  RequirementsPage,
} from '@/features/requirements';
import { NewRunPage, RunPage, RunsPage, RunTestPage } from '@/features/runs';
import { GenerateScenariosPage, ScenarioPage, ScenariosPage } from '@/features/scenarios';
import { SearchPage } from '@/features/search';
import { SettingsPage } from '@/features/settings';
import { GenerateTestCasesPage, TestCasePage, TestCasesPage } from '@/features/test-cases';
import { TraceabilityPage } from '@/features/traceability';
import { ids, paths } from '@/lib';

import { AuthRoute } from './AuthRoute';
import { page as title, type Text } from './handle';
import { NotFound } from './NotFound';
import { ProjectHome } from './ProjectHome';
import { ProjectRoute } from './ProjectRoute';
import { Root } from './Root';
import { RouteError } from './RouteError';
import { requireSession } from './session';
import { ShellRoute } from './ShellRoute';
import { SignedOutRoute } from './SignedOutRoute';
import { SoloRoute } from './SoloRoute';

function back(label: Text, to: (projectId: string, params: Params) => string) {
  return { label, to: (params: Params) => to(params.projectId ?? '', params) };
}

const defectsLabel: Text = (_, can) => (can('workspace') ? 'Defects' : 'Your defects');

function itemId(param: string, pattern: RegExp) {
  return ({ params }: LoaderFunctionArgs) => {
    if (!pattern.test(params[param] ?? '')) throw data(null, { status: 404 });
    return null;
  };
}

const dev: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: 'dev',
        handle: title('Dev tools'),
        lazy: async () => ({ Component: (await import('../dev')).DevPage }),
      },
      {
        path: 'dev/components',
        handle: title('Component gallery'),
        lazy: async () => ({ Component: (await import('../gallery')).Gallery }),
      },
    ]
  : [];

export const routes: RouteObject[] = [
  {
    Component: Root,
    ErrorBoundary: RouteError,
    HydrateFallback: () => null,
    children: [
      { index: true, loader: () => redirect(paths.projects) },
      {
        Component: AuthRoute,
        children: [
          {
            Component: SignedOutRoute,
            children: [
              { path: 'signin', Component: SignInPage, handle: title('Sign in') },
              { path: 'register', Component: RegisterPage, handle: title('Create your account') },
            ],
          },
          {
            path: 'forgot-password',
            Component: ForgotPasswordPage,
            handle: title('Reset your password'),
          },
        ],
      },
      {
        Component: SoloRoute,
        children: [
          {
            path: 'projects',
            Component: ProjectsPage,
            loader: requireSession,
            handle: title('Your projects'),
          },
          ...dev,
        ],
      },
      {
        Component: ShellRoute,
        loader: requireSession,
        children: [
          {
            path: 'account',
            Component: AccountPage,
            handle: title('Account settings', { narrow: true }),
          },
          { path: 'search', Component: SearchPage, handle: title('Search') },
          {
            path: 'notifications',
            Component: NotificationsPage,
            handle: title('Notifications', { narrow: true }),
          },
          {
            path: 'projects/:projectId',
            Component: ProjectRoute,
            children: [
              { index: true, Component: ProjectHome },
              {
                path: 'dashboard',
                Component: DashboardPage,
                handle: title('Dashboard', { can: 'workspace' }),
              },
              {
                path: 'my-work',
                Component: MyWorkPage,
                handle: title('My work', { can: 'workspace' }),
              },
              {
                path: 'requirements',
                Component: RequirementsPage,
                handle: title('Requirements', { can: 'workspace', stage: 'requirements' }),
              },
              {
                path: 'requirements/new',
                Component: AddRequirementsPage,
                handle: title('Add requirements', {
                  can: 'upload',
                  narrow: true,
                  stage: 'srs',
                  back: back('Requirements', paths.requirements),
                }),
              },
              {
                path: 'requirements/analysis',
                Component: AnalysisPage,
                handle: title('AI analysis', {
                  can: 'upload',
                  narrow: true,
                  stage: 'srs',
                  back: back('Requirements', paths.requirements),
                }),
              },
              {
                path: 'requirements/:requirementId',
                Component: RequirementPage,
                loader: itemId('requirementId', ids.requirement),
                handle: title((params) => params.requirementId ?? '', {
                  can: 'workspace',
                  stage: 'requirements',
                  back: back('Requirements', paths.requirements),
                }),
              },
              {
                path: 'scenarios',
                Component: ScenariosPage,
                handle: title('Test scenarios', { can: 'workspace', stage: 'scenarios' }),
              },
              {
                path: 'scenarios/generate',
                Component: GenerateScenariosPage,
                handle: title('Generating test scenarios', {
                  can: 'approve',
                  stage: 'scenarios',
                  back: back('Requirements', paths.requirements),
                }),
              },
              {
                path: 'scenarios/:scenarioId',
                Component: ScenarioPage,
                loader: itemId('scenarioId', ids.scenario),
                handle: title((params) => params.scenarioId ?? '', {
                  can: 'workspace',
                  stage: 'scenarios',
                  back: back('Test scenarios', paths.scenarios),
                }),
              },
              {
                path: 'test-cases',
                Component: TestCasesPage,
                handle: title('Test cases', { can: 'workspace', stage: 'test-cases' }),
              },
              {
                path: 'test-cases/generate',
                Component: GenerateTestCasesPage,
                handle: title('Generating test cases', {
                  can: 'approve',
                  stage: 'test-cases',
                  back: back('Test scenarios', paths.scenarios),
                }),
              },
              {
                path: 'test-cases/:testCaseId',
                Component: TestCasePage,
                loader: itemId('testCaseId', ids.testCase),
                handle: title((params) => params.testCaseId ?? '', {
                  can: 'workspace',
                  stage: 'test-cases',
                  back: back('Test cases', paths.testCases),
                }),
              },
              {
                path: 'runs',
                Component: RunsPage,
                handle: title('Test runs', { can: 'workspace', stage: 'runs' }),
              },
              {
                path: 'runs/new',
                Component: NewRunPage,
                handle: title('New test run', {
                  can: 'manage',
                  stage: 'runs',
                  back: back('Test runs', paths.runs),
                }),
              },
              {
                path: 'runs/:runId',
                Component: RunPage,
                loader: itemId('runId', ids.run),
                handle: title((params) => `Run ${params.runId ?? ''}`, {
                  can: 'workspace',
                  stage: 'runs',
                  back: back('Test runs', paths.runs),
                }),
              },
              {
                path: 'runs/:runId/:testCaseId',
                Component: RunTestPage,
                loader: (args) => {
                  itemId('runId', ids.run)(args);
                  return itemId('testCaseId', ids.testCase)(args);
                },
                handle: title('Run a test', {
                  can: 'test',
                  stage: 'runs',
                  crumb: (params) => `Run ${params.runId ?? ''}`,
                  back: back(
                    (params) => `Run ${params.runId ?? ''}`,
                    (projectId, params) => paths.run(projectId, params.runId ?? ''),
                  ),
                }),
              },
              {
                path: 'defects',
                Component: DefectsPage,
                handle: title(defectsLabel, { stage: 'defects' }),
              },
              {
                path: 'defects/:defectId',
                Component: DefectPage,
                loader: itemId('defectId', ids.defect),
                handle: title((params) => params.defectId ?? '', {
                  stage: 'defects',
                  back: back(defectsLabel, paths.defects),
                }),
              },
              {
                path: 'traceability',
                Component: TraceabilityPage,
                handle: title('Traceability', { can: 'trace' }),
              },
              {
                path: 'reports',
                Component: ReportsPage,
                handle: title('Reports', { can: 'manage' }),
              },
              {
                path: 'members',
                Component: MembersPage,
                handle: title('Members', { can: 'manage' }),
              },
              {
                path: 'activity',
                Component: ActivityPage,
                handle: title('Activity log', { can: 'manage', narrow: true }),
              },
              {
                path: 'settings',
                Component: SettingsPage,
                handle: title('Project settings', { can: 'manage', narrow: true }),
              },
            ],
          },
        ],
      },
      {
        path: '*',
        Component: NotFound,
        handle: title('Page not found'),
      },
    ],
  },
];
