/**
 * A worn black-and-white portrait plate. No photographs exist in the archive,
 * so each entry shows a monogram on an aged, grain-textured grey field —
 * styled to read like a faded filing-card portrait.
 */
export default function Portrait({
  name,
  className = "h-16 w-14",
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`portrait relative flex shrink-0 items-center justify-center border border-rule ${className}`}
    >
      <span className="font-display text-sm font-medium tracking-wide text-ink/70">
        {initials(name)}
      </span>
      {/* corner tick, like a registration mark on archival stock */}
      <span className="absolute right-1 top-1 h-1.5 w-1.5 border-r border-t border-ink/25" />
    </div>
  );
}

function initials(name: string): string {
  const words = name.replace(/[(),.]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "—";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
