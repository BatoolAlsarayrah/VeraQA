import { cn } from '@/lib';

const labels = [
  { x: 4, y: 308, text: 'REQ-014', id: true },
  { x: 4, y: 376, text: 'Approved', tone: 'fill-st-ok' },
  { x: 309, y: 108, text: 'SC-007', id: true },
  { x: 513, y: 32, text: 'TC-031', id: true },
  { x: 513, y: 92, text: 'Failed', tone: 'fill-st-bad' },
  { x: 605, y: 32, text: 'BUG-007', id: true },
  { x: 617, y: 92, text: 'Open', tone: 'fill-st-bad' },
  { x: 611, y: 242, text: 'TC-032', id: true },
  { x: 595, y: 302, text: 'Not run', tone: 'fill-on-rail-2' },
];

export function TraceDrawing({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 688 405"
      fill="none"
      aria-hidden="true"
      className={cn('h-auto w-full', className)}
    >
      <g strokeWidth="7.08" strokeLinecap="round" strokeLinejoin="round">
        <path d="M333.9 131.7h91l40.5 40.4v60.7l30.4 30.4h151.7" className="stroke-border-2" />
        <path d="M20.2 334h131.5l40.5-40.4V172.1l40.5-40.4h101.2" className="stroke-line" />
        <path d="M333.9 131.7h111.3l40.4-40.5V71l20.3-20.3h141.6" className="stroke-st-bad" />
      </g>
      <circle cx="20.2" cy="334" r="13.2" strokeWidth="7.08" className="fill-line stroke-line" />
      <circle cx="333.9" cy="131.7" r="11.1" strokeWidth="6.07" className="fill-line stroke-line" />
      <circle
        cx="536.2"
        cy="50.7"
        r="11.1"
        strokeWidth="6.07"
        className="fill-st-bad stroke-st-bad"
      />
      <circle
        cx="647.5"
        cy="50.7"
        r="11.1"
        strokeWidth="6.07"
        className="fill-rail stroke-st-bad"
      />
      <circle cx="647.5" cy="50.7" r="4" className="fill-st-bad" />
      <circle
        cx="647.5"
        cy="263.2"
        r="10.1"
        strokeWidth="2"
        className="fill-rail stroke-border-2"
      />
      {labels.map((label) =>
        label.id ? (
          <text
            key={label.text}
            x={label.x}
            y={label.y}
            fontSize="13"
            className="fill-on-rail-2 font-mono"
          >
            {label.text}
          </text>
        ) : (
          <text
            key={label.text}
            x={label.x}
            y={label.y}
            fontSize="14"
            fontWeight="700"
            className={label.tone}
          >
            {label.text}
          </text>
        ),
      )}
    </svg>
  );
}
