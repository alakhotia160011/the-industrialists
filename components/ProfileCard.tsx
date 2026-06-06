import Link from "next/link";
import Portrait from "@/components/Portrait";
import { getCatalogNumber } from "@/lib/profiles";
import type { Industrialist } from "@/lib/types";

export default function ProfileCard({ person }: { person: Industrialist }) {
  return (
    <Link
      href={`/${person.slug}`}
      className="filing-card group flex gap-4 border border-rule p-4 transition-colors duration-200 hover:border-accent"
    >
      <Portrait name={person.name} className="h-20 w-16" />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-tight tracking-tight text-ink transition-colors group-hover:text-accent">
            {person.name}
          </h3>
          <span className="mt-0.5 shrink-0 font-mono text-[0.65rem] tracking-wider text-muted tabular-nums">
            No.&nbsp;{getCatalogNumber(person.slug)}
          </span>
        </div>

        {/* patina-green rule beneath the name */}
        <span className="mt-2 block h-px w-full bg-accent/45 transition-colors group-hover:bg-accent-soft" />

        <p className="mt-2 truncate font-mono text-[0.72rem] leading-relaxed tracking-wide text-muted">
          {person.company}
        </p>
        <p className="font-mono text-[0.72rem] tracking-wide text-muted tabular-nums">
          {person.years}
        </p>

        {person.tagline && (
          <p className="mt-auto pt-2 font-display text-sm italic text-accent">
            {person.tagline}
          </p>
        )}
      </div>
    </Link>
  );
}
