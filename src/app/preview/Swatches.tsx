const groups = [
  {
    name: 'Neutral',
    swatches: [
      { name: 'bg', className: 'bg-bg' },
      { name: 'surface', className: 'bg-surface' },
      { name: 'subtle', className: 'bg-subtle' },
      { name: 'field', className: 'bg-field' },
      { name: 'border', className: 'bg-border' },
      { name: 'border-2', className: 'bg-border-2' },
      { name: 'text', className: 'bg-text' },
      { name: 'text-2', className: 'bg-text-2' },
      { name: 'text-3', className: 'bg-text-3' },
    ],
  },
  {
    name: 'Iris',
    swatches: [
      { name: 'primary', className: 'bg-primary' },
      { name: 'primary-fill', className: 'bg-primary-fill' },
      { name: 'primary-ledge', className: 'bg-primary-ledge' },
      { name: 'sel', className: 'bg-sel' },
      { name: 'sel-border', className: 'bg-sel-border' },
    ],
  },
  {
    name: 'AI',
    swatches: [
      { name: 'ai', className: 'bg-ai' },
      { name: 'ai-ink', className: 'bg-ai-ink' },
      { name: 'ai-bg', className: 'bg-ai-bg' },
      { name: 'ai-border', className: 'bg-ai-border' },
    ],
  },
  {
    name: 'Rail',
    swatches: [
      { name: 'rail', className: 'bg-rail' },
      { name: 'rail-2', className: 'bg-rail-2' },
      { name: 'rail-3', className: 'bg-rail-3' },
      { name: 'rail-on', className: 'bg-rail-on' },
      { name: 'on-rail', className: 'bg-on-rail' },
    ],
  },
  {
    name: 'Status',
    swatches: [
      { name: 'ok', className: 'bg-ok' },
      { name: 'ok-bg', className: 'bg-ok-bg' },
      { name: 'bad', className: 'bg-bad' },
      { name: 'bad-bg', className: 'bg-bad-bg' },
      { name: 'bad-fill', className: 'bg-bad-fill' },
      { name: 'warn', className: 'bg-warn' },
      { name: 'warn-bg', className: 'bg-warn-bg' },
      { name: 'warn-fill', className: 'bg-warn-fill' },
    ],
  },
];

export function Swatches() {
  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <h3 className="text-label">{group.name}</h3>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3">
            {group.swatches.map((swatch) => (
              <li key={swatch.name} className="flex flex-col gap-1.5">
                <span
                  className={`${swatch.className} h-12 rounded-control border border-border transition-theme`}
                />
                <span className="text-body-sm text-text-2">{swatch.name}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
