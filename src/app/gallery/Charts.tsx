import { ResultsChart, SeverityChart } from '@/components/domain';
import { Panel } from '@/components/ui';

export function Charts() {
  return (
    <div className="grid gap-5 desktop:grid-cols-2">
      <Panel title="Open defects by severity">
        <SeverityChart
          caption="Open defects by severity"
          counts={{ critical: 1, high: 3, medium: 2, low: 1 }}
        />
      </Panel>
      <Panel title="Test results in Run 12 · Sprint 4 regression">
        <ResultsChart
          caption="Test results in Run 12"
          counts={{ passed: 18, failed: 3, blocked: 1, notRun: 12 }}
        />
      </Panel>
    </div>
  );
}
