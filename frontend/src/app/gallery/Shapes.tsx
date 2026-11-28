const radii = [
  { name: 'inner · 4', className: 'rounded-inner' },
  { name: 'sm · 6', className: 'rounded-sm' },
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
    </div>
  );
}
