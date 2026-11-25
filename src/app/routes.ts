import { data, type LoaderFunctionArgs, redirect, type RouteObject } from 'react-router';

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
import { page as title } from './handle';
import { ProjectHome } from './ProjectHome';
import { ProjectRoute } from './ProjectRoute';
import { Root } from './Root';
import { RouteError } from './RouteError';
import { ShellRoute } from './ShellRoute';
import { SoloRoute } from './SoloRoute';

function itemId(param: string, pattern: RegExp) {
  return ({ params }: LoaderFunctionArgs) => {
    if (!pattern.test(params[param] ?? '')) throw data(null, { status: 404 });
    return null;
  };
}

const dev: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: 'dev/components',
        handle: title('Component gallery'),
        lazy: async () => ({ Component: (await import('./gallery')).Gallery }),
      },
    ]
  : [];

export const routes: RouteObject[] = [
  {
    Component: Root,
    ErrorBoundary: RouteError,
    children: [
      { index: true, loader: () => redirect(paths.projects) },
      {
        Component: AuthRoute,
        children: [
          { path: 'signin', Component: SignInPage, handle: title('Sign in') },
          { path: 'register', Component: RegisterPage, handle: title('Create your account') },
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
          { path: 'projects', Component: ProjectsPage, handle: title('Your projects') },
          ...dev,
        ],
      },
      {
        Component: ShellRoute,
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
                handle: title('Requirements', { can: 'workspace' }),
              },
              {
                path: 'requirements/new',
                Component: AddRequirementsPage,
                handle: title('Add requirements', { can: 'upload', narrow: true }),
              },
              {
                path: 'requirements/analysis',
                Component: AnalysisPage,
                handle: title('AI analysis', { can: 'upload', narrow: true }),
              },
              {
                path: 'requirements/:requirementId',
                Component: RequirementPage,
                loader: itemId('requirementId', ids.requirement),
                handle: title((params) => params.requirementId ?? '', { can: 'workspace' }),
              },
              {
                path: 'scenarios',
                Component: ScenariosPage,
                handle: title('Test scenarios', { can: 'workspace' }),
              },
              {
                path: 'scenarios/generate',
                Component: GenerateScenariosPage,
                handle: title('Generating test scenarios', { can: 'approve' }),
              },
              {
                path: 'scenarios/:scenarioId',
                Component: ScenarioPage,
                loader: itemId('scenarioId', ids.scenario),
                handle: title((params) => params.scenarioId ?? '', { can: 'workspace' }),
              },
              {
                path: 'test-cases',
                Component: TestCasesPage,
                handle: title('Test cases', { can: 'workspace' }),
              },
              {
                path: 'test-cases/generate',
                Component: GenerateTestCasesPage,
                handle: title('Generating test cases', { can: 'approve' }),
              },
              {
                path: 'test-cases/:testCaseId',
                Component: TestCasePage,
                loader: itemId('testCaseId', ids.testCase),
                handle: title((params) => params.testCaseId ?? '', { can: 'workspace' }),
              },
              {
                path: 'runs',
                Component: RunsPage,
                handle: title('Test runs', { can: 'workspace' }),
              },
              {
                path: 'runs/new',
                Component: NewRunPage,
                handle: title('New test run', { can: 'manage' }),
              },
              {
                path: 'runs/:runId',
                Component: RunPage,
                loader: itemId('runId', ids.run),
                handle: title((params) => `Run ${params.runId ?? ''}`, { can: 'workspace' }),
              },
              {
                path: 'runs/:runId/:testCaseId',
                Component: RunTestPage,
                loader: (args) => {
                  itemId('runId', ids.run)(args);
                  return itemId('testCaseId', ids.testCase)(args);
                },
                handle: title('Run a test', { can: 'test' }),
              },
              {
                path: 'defects',
                Component: DefectsPage,
                handle: title((_, can) => (can('workspace') ? 'Defects' : 'Your defects')),
              },
              {
                path: 'defects/:defectId',
                Component: DefectPage,
                loader: itemId('defectId', ids.defect),
                handle: title((params) => params.defectId ?? ''),
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
        loader: () => {
          throw data(null, { status: 404 });
        },
      },
    ],
  },
];
