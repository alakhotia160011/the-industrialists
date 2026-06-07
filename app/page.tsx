import ProfileCard from "@/components/ProfileCard";
import { getAllPeople, getPeopleBySector } from "@/lib/profiles";

export default function Home() {
  const groups = getPeopleBySector();
  const people = getAllPeople();
  const total = people.length;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-28">
      <Hero total={total} sectors={groups.length} people={people} />

      {/* Catalogue: monospaced table of contents + filing cards, joined by a
          patina-green spine running down the page. */}
      <div className="mt-4 grid grid-cols-1 gap-10 md:grid-cols-[13rem_1fr]">
        <TableOfContents groups={groups} />

        <div className="md:border-l md:border-accent/30 md:pl-10">
          {groups.map(({ sector, people }) => (
            <section
              key={sector}
              id={slugifySector(sector)}
              className="scroll-mt-8 border-t border-rule py-10 first:border-t-0 first:pt-0"
            >
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h2 className="font-display text-2xl tracking-tight text-ink">
                  {sector}
                </h2>
                <span className="font-mono text-[0.7rem] tracking-[0.2em] text-muted tabular-nums">
                  {String(people.length).padStart(2, "0")} ENTRIES
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {people.map((person) => (
                  <ProfileCard key={person.slug} person={person} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

    </div>
  );
}

function Hero({
  total,
  sectors,
  people,
}: {
  total: number;
  sectors: number;
  people: { name: string; years: string }[];
}) {
  return (
    <header className="relative isolate overflow-hidden pt-20 pb-12 sm:pt-28">
      <NoiseLayer people={people} />

      <p className="eyebrow">An Industrial Archive · Overlooked American Builders</p>

      <h1 className="mt-5 max-w-4xl font-display text-6xl font-medium leading-[0.92] tracking-tight text-ink sm:text-8xl">
        The Industrialists
      </h1>

      <p className="mt-4 font-mono text-xs tracking-[0.2em] text-muted">
        REF · FP-ARCHIVE / VOL. I · {String(total).padStart(3, "0")} ENTRIES ·{" "}
        {String(sectors).padStart(2, "0")} SECTIONS
      </p>

      <p className="mt-8 max-w-2xl font-body text-lg leading-relaxed text-ink/90">
        A filing cabinet of the founders and operators who built enduring
        American companies and were quietly forgotten. Each entry is researched
        from primary and secondary sources, annotated with footnotes, and{" "}
        <span className="italic text-accent">narrated aloud</span>.
      </p>

      <span className="mt-10 block h-px w-full bg-ink" />
    </header>
  );
}

/**
 * A faint layer of names, dates, and ASCII fragments behind the title, the
 * raw index, dissolving into the headline. Masked to fade toward the baseline.
 */
function NoiseLayer({ people }: { people: { name: string; years: string }[] }) {
  const fragments = "／ · ▓ ░ ╳ ┊ ╎ ▚ · [ ] ∴ ░ ▓ ※ ⌁ ·".split(" ");
  const tokens: string[] = [];
  people.forEach((p, i) => {
    tokens.push(p.name.toUpperCase(), p.years, fragments[i % fragments.length]);
  });
  const line = tokens.join("  ");

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden font-mono text-[0.62rem] leading-5 tracking-wide text-ink/[0.06]"
      style={{
        maskImage:
          "linear-gradient(to bottom, black, transparent 78%), radial-gradient(80% 60% at 30% 35%, transparent 35%, black 80%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black, transparent 78%), radial-gradient(80% 60% at 30% 35%, transparent 35%, black 80%)",
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    >
      <div className="whitespace-pre-wrap break-words">{`${line}  ${line}  ${line}`}</div>
    </div>
  );
}

function TableOfContents({
  groups,
}: {
  groups: { sector: string; people: unknown[] }[];
}) {
  return (
    <nav
      aria-label="Table of contents"
      className="top-8 self-start md:sticky"
    >
      <p className="eyebrow mb-4 border-b border-rule pb-3">Contents</p>
      <ol className="space-y-2.5">
        {groups.map(({ sector, people }, i) => (
          <li key={sector}>
            <a
              href={`#${slugifySector(sector)}`}
              className="group flex items-baseline justify-between gap-3 font-mono text-[0.72rem] leading-snug tracking-wide text-muted transition-colors hover:text-accent"
            >
              <span className="flex min-w-0 gap-2">
                <span className="text-accent/60 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate group-hover:underline">{sector}</span>
              </span>
              <span className="shrink-0 tabular-nums text-rule group-hover:text-accent">
                {String(people.length).padStart(2, "0")}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function slugifySector(sector: string): string {
  return sector.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
