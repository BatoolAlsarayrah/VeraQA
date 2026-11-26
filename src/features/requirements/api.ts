import { queryOptions, useQuery } from '@tanstack/react-query';
import { useEffect, useSyncExternalStore } from 'react';

import { keys, queryClient, request } from '@/lib';
import { Job, JobStart, list } from '@/types';

export type Analysis = Extract<Job, { kind: 'analysis' }>;

const path = (projectId: string) => `/projects/${encodeURIComponent(projectId)}`;

export const jobQuery = (jobId: string) =>
  queryOptions({
    queryKey: keys.job(jobId),
    queryFn: () => request(`/jobs/${encodeURIComponent(jobId)}`, Job),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'queued' || status === 'running' ? 1000 : false;
    },
  });

export const activeJobsQuery = (projectId: string) =>
  queryOptions({
    queryKey: [...keys.project(projectId), 'jobs', 'active'],
    queryFn: () => request(`${path(projectId)}/jobs`, list(Job), { query: { active: true } }),
    refetchInterval: 15_000,
  });

// The tab remembers the analysis it saw running, so the banner can still say "Analysis complete"
// after the job leaves the active list, until the person opens Requirements.
const KEY = 'veraqa-analysis';
const listeners = new Set<() => void>();

function read(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

let seen = read();

function write(next: Record<string, string>) {
  seen = next;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be blocked; the banner then forgets the analysis on reload.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function rememberAnalysis(projectId: string, jobId: string) {
  if (seen[projectId] !== jobId) write({ ...seen, [projectId]: jobId });
}

export function forgetAnalysis(projectId: string) {
  if (!(projectId in seen)) return;
  const { [projectId]: _, ...rest } = seen;
  write(rest);
}

export async function uploadSrs(projectId: string, files: File[]) {
  const form = new FormData();
  for (const file of files) form.append('files', file);
  const { jobId } = await request(`${path(projectId)}/srs`, JobStart, { method: 'POST', form });
  rememberAnalysis(projectId, jobId);
  return jobId;
}

export async function cancelJob(jobId: string) {
  const job = await request(`/jobs/${encodeURIComponent(jobId)}/cancel`, Job, { method: 'POST' });
  queryClient.setQueryData(keys.job(jobId), job);
  return job;
}

export function useAnalysis(projectId: string | undefined, enabled: boolean): Analysis | null {
  const remembered = useSyncExternalStore(subscribe, () =>
    projectId ? seen[projectId] : undefined,
  );
  const active = useQuery({ ...activeJobsQuery(projectId ?? ''), enabled: enabled && !!projectId });
  const running = active.data?.items.find((job) => job.kind === 'analysis');
  const jobId = running?.id ?? remembered;
  const job = useQuery({ ...jobQuery(jobId ?? ''), enabled: enabled && !!jobId });
  const status = job.data?.status;

  useEffect(() => {
    if (projectId && running && running.id !== remembered) rememberAnalysis(projectId, running.id);
  }, [projectId, running, remembered]);

  useEffect(() => {
    if (status !== 'done' || !projectId) return;
    void queryClient.invalidateQueries({ queryKey: keys.project(projectId) });
    void queryClient.invalidateQueries({ queryKey: keys.notifications(projectId) });
  }, [status, projectId]);

  if (job.data?.kind !== 'analysis') return null;
  if (job.data.status === 'cancelled' || job.data.status === 'failed') return null;
  return job.data;
}
