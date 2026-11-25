import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { useAnalysis } from '@/hooks';
import { setDemoAnalysis } from '@/lib';

function start(files: string[]) {
  setDemoAnalysis({ files, startedAt: Date.now(), done: false });
}

export function AnalysisSwitcher() {
  const analysis = useAnalysis();
  const state = !analysis
    ? 'No analysis running.'
    : analysis.done
      ? 'The analysis is complete. Opening Requirements clears the banner.'
      : `Step ${analysis.step} of ${analysis.total}.`;

  return (
    <Panel title="Analysis banner">
      <p className="text-text-2">
        Shows on project pages for people who can add requirements, except on Add requirements and
        AI analysis. {state}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => start(['SRS_v2.pdf'])}>Start with 1 file</Button>
        <Button onClick={() => start(['SRS_v2.pdf', 'Checkout_flow.docx'])}>
          Start with 2 files
        </Button>
        <Button
          disabled={!analysis || analysis.done}
          onClick={() => analysis && setDemoAnalysis({ ...analysis, startedAt: 0, done: true })}
        >
          Finish now
        </Button>
        <Button variant="danger" disabled={!analysis} onClick={() => setDemoAnalysis(null)}>
          Clear
        </Button>
      </div>
    </Panel>
  );
}
