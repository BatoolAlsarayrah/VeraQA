const styles = [
  { name: 'display', spec: '46/54 · 700', className: 'text-display', sample: "Ship what's true." },
  {
    name: 'display-md',
    spec: '34/42 · 700 (Page not found)',
    className: 'text-display-md',
    sample: 'This stop isn’t on the line',
  },
  {
    name: 'display-sm',
    spec: '32/38 · 700 (phones)',
    className: 'text-display-sm',
    sample: "Ship what's true.",
  },
  { name: 'metric', spec: '30/38 · 700', className: 'text-metric', sample: '21 approved' },
  { name: 'headline', spec: '26/32 · 700', className: 'text-headline', sample: 'Requirements' },
  { name: 'wordmark', spec: '22/28 · 700', className: 'text-wordmark', sample: 'VeraQA' },
  {
    name: 'statement',
    spec: '20/30 · 400',
    className: 'text-statement',
    sample: 'The system shall lock an account after 5 failed sign-in attempts.',
  },
  {
    name: 'dialog-title',
    spec: '18/24 · 700',
    className: 'text-dialog-title',
    sample: 'Approve 7 test cases',
  },
  { name: 'title', spec: '15/22 · 700', className: 'text-title', sample: 'Pending review' },
  {
    name: 'body-lg',
    spec: '16/24 · 400',
    className: 'text-body-lg',
    sample: 'Field text below 901px, and the sign-in subline on phones',
  },
  {
    name: 'body',
    spec: '14/22 · 400',
    className: 'text-body',
    sample: 'Every defect traces back to the requirement it broke.',
  },
  { name: 'body-strong', spec: '14/22 · 600', className: 'text-body-strong', sample: 'Add to run' },
  {
    name: 'body-sm',
    spec: '13/20 · 400',
    className: 'text-body-sm',
    sample: 'Waiting for Batool Mahmoud to retest',
  },
  { name: 'label', spec: '13/20 · 600', className: 'text-label', sample: 'Project name' },
  {
    name: 'caption',
    spec: '12/16 · 400',
    className: 'text-caption',
    sample: 'Updated 2 minutes ago',
  },
  { name: 'badge', spec: '12/18 · 600', className: 'text-badge', sample: 'AI draft' },
  { name: 'micro', spec: '11/16 · 600', className: 'text-micro', sample: '12' },
  { name: 'tab-label', spec: '11/14 · 500', className: 'text-tab-label', sample: 'My work' },
  {
    name: 'id',
    spec: '12/16 · 400 mono',
    className: 'text-id',
    sample: 'REQ-014 · SC-007 · TC-031 · BUG-007 · Run 12',
  },
];

export function TypeScale() {
  return (
    <dl className="flex flex-col">
      {styles.map((style) => (
        <div
          key={style.name}
          className="flex flex-col gap-1 border-t border-border py-3 first:border-t-0 first:pt-0 tablet:flex-row tablet:items-baseline tablet:gap-6"
        >
          <dt className="text-caption text-text-3 tablet:w-40 tablet:shrink-0">
            {style.name} · {style.spec}
          </dt>
          <dd className={`${style.className} min-w-0`}>{style.sample}</dd>
        </div>
      ))}
    </dl>
  );
}
