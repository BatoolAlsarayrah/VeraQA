// Stand-in until Phase 3: the shell's counts come from the mock API (and later the live API).
type Counts = {
  myWork: number;
  pendingReview: number;
  openDefects: number;
};

const counts: Record<string, Counts> = {
  'e-commerce-portal-v2': { myWork: 6, pendingReview: 5, openDefects: 7 },
  'clinic-booking-app': { myWork: 4, pendingReview: 5, openDefects: 7 },
  'payments-api': { myWork: 0, pendingReview: 0, openDefects: 0 },
  'library-system': { myWork: 6, pendingReview: 5, openDefects: 7 },
};

export function demoCounts(projectId: string): Counts {
  return counts[projectId] ?? { myWork: 0, pendingReview: 0, openDefects: 0 };
}
