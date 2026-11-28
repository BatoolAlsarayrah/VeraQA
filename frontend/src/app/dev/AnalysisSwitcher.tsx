import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { cancelJob, forgetAnalysis, uploadSrs, useAnalysis } from '@/features/requirements';
import type { Membership } from '@/types';

const sample = (name: string) => new File(['Sample SRS for the mock API.'], name);

export function AnalysisSwitcher({ project }: { project: Membership }) {
  const canUpload = project.capabilities.includes('upload');
  const analysis = useAnalysis(project.projectId, canUpload);
  const start = useMutation({
    mutationFn: (names: string[]) => uploadSrs(project.projectId, names.map(sample)),
  });
  const cancel = useMutation({ mutationFn: cancelJob });
  const running = analysis?.status === 'running' || analysis?.status === 'queued';
  const state = !analysis
    ? 'No analysis running.'
    : running
      ? `Step ${String(analysis.step + 1)} of ${String(analysis.steps.length)}.`
      : 'The analysis is complete. Opening Requirements clears the banner.';

  return (
    <Panel title={`Analysis banner in ${project.projectName}`}>
      {canUpload ? (
        <>
          <p className="text-text-2">
            Starts a real analysis job in the mock. The banner shows on project pages for people who
            can add requirements, except on Add requirements and AI analysis. {state}
          </p>
          {start.error && <p className="text-bad">{start.error.message}</p>}
          <div className="flex flex-wrap gap-3">
            <Button disabled={running} onClick={() => start.mutate(['SRS_v2.pdf'])}>
              Start with 1 file
            </Button>
            <Button
              disabled={running}
              onClick={() => start.mutate(['SRS_v2.pdf', 'Checkout_flow.docx'])}
            >
              Start with 2 files
            </Button>
            <Button disabled={!running} onClick={() => analysis && cancel.mutate(analysis.id)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={!analysis}
              onClick={() => forgetAnalysis(project.projectId)}
            >
              Hide banner
            </Button>
          </div>
        </>
      ) : (
        <p className="text-text-2">
          This role can’t add requirements in {project.projectName}, so there’s no banner to show.
          Pick another project or role above.
        </p>
      )}
    </Panel>
  );
}
