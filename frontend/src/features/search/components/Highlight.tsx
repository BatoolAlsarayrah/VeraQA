export function Highlight({ text, match }: { text: string; match: string }) {
  const needle = match.trim().toLowerCase();
  if (!needle) return text;

  const parts: { text: string; hit: boolean }[] = [];
  let from = 0;
  for (
    let at = text.toLowerCase().indexOf(needle);
    at !== -1;
    at = text.toLowerCase().indexOf(needle, from)
  ) {
    if (at > from) parts.push({ text: text.slice(from, at), hit: false });
    parts.push({ text: text.slice(at, at + needle.length), hit: true });
    from = at + needle.length;
  }
  if (from < text.length) parts.push({ text: text.slice(from), hit: false });

  return parts.map((part, index) =>
    part.hit ? (
      <mark key={index} className="rounded-inner bg-warn-bg px-0.5 text-text">
        {part.text}
      </mark>
    ) : (
      part.text
    ),
  );
}
