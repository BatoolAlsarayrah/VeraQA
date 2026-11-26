const at = (projectId: string) => `/projects/${encodeURIComponent(projectId)}`;

export const paths = {
  home: '/',
  signin: '/signin',
  register: '/register',
  forgotPassword: '/forgot-password',
  projects: '/projects',
  account: '/account',
  search: '/search',
  notifications: '/notifications',
  dev: '/dev',
  components: '/dev/components',
  project: at,
  dashboard: (p: string) => `${at(p)}/dashboard`,
  myWork: (p: string) => `${at(p)}/my-work`,
  requirements: (p: string) => `${at(p)}/requirements`,
  addRequirements: (p: string) => `${at(p)}/requirements/new`,
  analysis: (p: string) => `${at(p)}/requirements/analysis`,
  requirement: (p: string, id: string) => `${at(p)}/requirements/${id}`,
  scenarios: (p: string) => `${at(p)}/scenarios`,
  generateScenarios: (p: string) => `${at(p)}/scenarios/generate`,
  scenario: (p: string, id: string) => `${at(p)}/scenarios/${id}`,
  testCases: (p: string) => `${at(p)}/test-cases`,
  generateTestCases: (p: string) => `${at(p)}/test-cases/generate`,
  testCase: (p: string, id: string) => `${at(p)}/test-cases/${id}`,
  runs: (p: string) => `${at(p)}/runs`,
  newRun: (p: string) => `${at(p)}/runs/new`,
  run: (p: string, run: string) => `${at(p)}/runs/${run}`,
  runTest: (p: string, run: string, testCase: string) => `${at(p)}/runs/${run}/${testCase}`,
  defects: (p: string) => `${at(p)}/defects`,
  defect: (p: string, id: string) => `${at(p)}/defects/${id}`,
  traceability: (p: string) => `${at(p)}/traceability`,
  reports: (p: string) => `${at(p)}/reports`,
  members: (p: string) => `${at(p)}/members`,
  activity: (p: string) => `${at(p)}/activity`,
  settings: (p: string) => `${at(p)}/settings`,
};

export const ids = {
  requirement: /^REQ-\d+$/,
  scenario: /^SC-\d+$/,
  testCase: /^TC-\d+$/,
  run: /^\d+$/,
  defect: /^BUG-\d+$/,
};

const open = [paths.signin, paths.register, paths.forgotPassword, paths.dev];

export function isOpen(pathname: string) {
  return open.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

// Only same-site paths come back from ?from=, so a crafted link can't send someone elsewhere.
export function returnTo(from: string | null) {
  if (!from?.startsWith('/') || from.startsWith('//') || from.startsWith('/\\')) {
    return paths.projects;
  }
  return isOpen(new URL(from, 'https://veraqa.local').pathname) ? paths.projects : from;
}

export function signinFrom(from: string) {
  const back = returnTo(from);
  return back === paths.projects || back === paths.home
    ? paths.signin
    : `${paths.signin}?${new URLSearchParams({ from }).toString()}`;
}
