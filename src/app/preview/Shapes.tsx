const radii = [
  { name: 'inner · 4', className: 'rounded-inner' },
  { name: 'control · 8', className: 'rounded-control' },
  { name: 'panel · 10', className: 'rounded-panel' },
  { name: 'sheet · 16', className: 'rounded-sheet' },
  { name: 'pill', className: 'rounded-pill' },
  { name: 'full', className: 'rounded-full' },
];

const shadows = [
  { name: 'pop', className: 'shadow-pop' },
  { name: 'card', className: 'shadow-card' },
  { name: 'card-hover', className: 'shadow-card-hover' },
  { name: 'segment', className: 'shadow-segment' },
  { name: 'current', className: 'shadow-current' },
];

export function Shapes() {
  return (
    <div className="flex flex-col gap-6">
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-4">
        {radii.map((radius) => (
          <li key={radius.name} className="flex flex-col items-start gap-1.5">
            <span className={`${radius.className} size-14 border border-sel-border bg-sel`} />
            <span className="text-body-sm text-text-2">{radius.name}</span>
          </li>
        ))}
      </ul>

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-5 rounded-panel bg-bg p-5">
        {shadows.map((shadow) => (
          <li
            key={shadow.name}
            className={`${shadow.className} rounded-panel bg-surface px-3 py-4 text-body-sm text-text-2`}
          >
            {shadow.name}
          </li>
        ))}
        <li className="flex items-center gap-5 px-3 py-4">
          <span className="size-4 rounded-full border-2 border-primary bg-surface shadow-halo" />
          <span className="size-4 animate-halo rounded-full border-2 border-ai bg-surface shadow-halo-ai" />
          <span className="text-body-sm text-text-2">halos</span>
        </li>
      </ul>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="min-h-10 rounded-control bg-primary-fill px-4 text-body-strong text-on-p shadow-ledge-primary transition-press hover:bg-primary-hover active:translate-y-0.75 active:shadow-none"
        >
          Approve
        </button>
        <button
          type="button"
          className="min-h-10 rounded-control bg-surface px-4 text-body-strong text-text shadow-ledge-secondary transition-press hover:bg-subtle active:translate-y-0.5 active:shadow-ledge-secondary-pressed"
        >
          Edit
        </button>
        <button
          type="button"
          className="min-h-10 rounded-control bg-surface px-4 text-body-strong text-bad shadow-ledge-danger transition-press hover:bg-bad-bg active:translate-y-0.5 active:shadow-ledge-danger-pressed"
        >
          Reject
        </button>
        <button
          type="button"
          className="min-h-10 rounded-control bg-bad-fill px-4 text-body-strong text-on-bad shadow-ledge-danger-fill transition-press hover:bg-bad-fill-hover active:translate-y-0.5 active:shadow-none"
        >
          Delete project
        </button>
        <button
          type="button"
          className="min-h-10 rounded-control border border-ai-border bg-ai-bg px-4 text-body-strong text-ai-ink transition-press hover:bg-ai-hover"
        >
          Suggest a rewrite
        </button>
        <button
          type="button"
          className="min-h-10 rounded-control px-2 text-body-strong text-text-2 transition-press hover:bg-subtle"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
