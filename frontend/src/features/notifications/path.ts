import { paths } from '@/lib';
import type { Notification } from '@/types';

export function notificationPath(projectId: string, { type, id }: Notification['target']) {
  const job = id ? `?job=${encodeURIComponent(id)}` : '';
  switch (type) {
    case 'requirement':
      return id ? paths.requirement(projectId, id) : paths.requirements(projectId);
    case 'requirements':
      return paths.requirements(projectId);
    case 'scenario':
      return id ? paths.scenario(projectId, id) : paths.scenarios(projectId);
    case 'scenarios':
      return paths.scenarios(projectId);
    case 'test-case':
      return id ? paths.testCase(projectId, id) : paths.testCases(projectId);
    case 'test-cases':
      return paths.testCases(projectId);
    case 'run':
      return id ? paths.run(projectId, id) : paths.runs(projectId);
    case 'defect':
      return id ? paths.defect(projectId, id) : paths.defects(projectId);
    case 'my-work':
      return paths.myWork(projectId);
    case 'members':
      return paths.members(projectId);
    case 'analysis':
      return paths.analysis(projectId) + job;
    case 'scenario-generation':
      return paths.generateScenarios(projectId) + job;
    case 'test-case-generation':
      return paths.generateTestCases(projectId) + job;
  }
}
