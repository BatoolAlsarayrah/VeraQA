import { useEffect, useState, useSyncExternalStore } from 'react';

import {
  analysisFound,
  analysisStepMs,
  analysisSteps,
  getDemoAnalysis,
  setDemoAnalysis,
  subscribeDemoAnalysis,
} from '@/lib';

const total = analysisStepMs * analysisSteps;

export function useAnalysis() {
  const analysis = useSyncExternalStore(subscribeDemoAnalysis, getDemoAnalysis);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!analysis || analysis.done) return;
    function tick() {
      if (!analysis) return;
      const time = Date.now();
      if (time - analysis.startedAt >= total) setDemoAnalysis({ ...analysis, done: true });
      else setNow(time);
    }
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [analysis]);

  if (!analysis) return null;
  const elapsed = Math.max(0, now - analysis.startedAt);
  const done = analysis.done || elapsed >= total;

  return {
    files: analysis.files,
    done,
    step: done ? analysisSteps : Math.min(analysisSteps, 1 + Math.floor(elapsed / analysisStepMs)),
    total: analysisSteps,
    found: analysisFound,
  };
}
