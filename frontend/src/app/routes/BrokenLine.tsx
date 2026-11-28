export function BrokenLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 433 113" fill="none" aria-hidden="true" className={className}>
      <g strokeLinecap="round" strokeWidth="6.6">
        <path d="M18.8 56.5H160" className="stroke-on-rail" />
        <path d="M184.5 56.5H235.3" strokeWidth="1" className="stroke-line" />
        <path d="M273 56.5H414.2" className="stroke-line" />
        <circle cx="18.8" cy="56.5" r="11.3" className="fill-rail stroke-on-rail" />
        <circle cx="160" cy="56.5" r="11.3" className="fill-rail stroke-on-rail" />
        <circle cx="414.2" cy="56.5" r="11.3" className="fill-rail stroke-line" />
      </g>
    </svg>
  );
}
