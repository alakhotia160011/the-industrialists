/**
 * A worn black-and-white portrait plate. When a real photograph is available
 * (src) it's shown desaturated to read like archival stock; otherwise the entry
 * falls back to a monogram on an aged, grain-textured grey field.
 */
export default function Portrait({
  name,
  src,
  className = "h-16 w-14",
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  return (
    <div
      aria-hidden={!src}
      className={`portrait relative flex shrink-0 items-center justify-center overflow-hidden border border-rule ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Portrait of ${name}`}
          loading="lazy"
          className="h-full w-full object-cover object-top grayscale contrast-[1.05]"
        />
      ) : (
        <span className="font-display text-sm font-medium tracking-wide text-ink/70">
          {initials(name)}
        </span>
      )}
      {/* corner tick, like a registration mark on archival stock */}
      <span className="absolute right-1 top-1 h-1.5 w-1.5 border-r border-t border-ink/25" />
    </div>
  );
}

function initials(name: string): string {
  const words = name.replace(/[(),.]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "·";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
