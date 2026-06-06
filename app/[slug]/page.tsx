import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NarrationPlayer from "@/components/NarrationPlayer";
import Portrait from "@/components/Portrait";
import {
  getAllPeople,
  getCatalogNumber,
  getPerson,
  getPortrait,
  getProfile,
} from "@/lib/profiles";
import type { Source, Excerpt } from "@/lib/types";

export function generateStaticParams() {
  return getAllPeople().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const person = getPerson(slug);
  if (!person) return { title: "Not found · The Industrialists" };
  return {
    title: `${person.name} · The Industrialists`,
    description: `${person.name}, ${person.company} (${person.years}).`,
  };
}

export default async function ProfilePage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const person = getPerson(slug);
  if (!person) notFound();

  const profile = getProfile(slug);
  const sourceMap = new Map<number, Source>(
    (profile?.sources ?? []).map((s) => [s.id, s]),
  );

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24">
      <nav className="flex items-center justify-between pt-10">
        <Link
          href="/"
          className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
        >
          ← The Industrialists
        </Link>
        <span className="font-mono text-[0.7rem] tracking-[0.2em] text-muted tabular-nums">
          No.&nbsp;{getCatalogNumber(person.slug)}
        </span>
      </nav>

      {/* Header, filing card masthead */}
      <header className="border-b border-ink pt-8 pb-8">
        <p className="eyebrow">{person.sector}</p>
        <div className="mt-3 flex items-start gap-5">
          <Portrait
            name={person.name}
            src={getPortrait(person.slug)}
            className="hidden h-24 w-20 sm:flex"
          />
          <div className="min-w-0">
            <h1 className="font-display text-4xl leading-[0.98] tracking-tight text-ink sm:text-6xl">
              {person.name}
            </h1>
            <p className="mt-3 font-mono text-sm tracking-wide text-muted">
              {person.company}
              <span> · </span>
              <span className="tabular-nums">{person.years}</span>
            </p>
            {/* patina-green rule */}
            <span className="mt-4 block h-px w-24 bg-accent" />
          </div>
        </div>
        {profile?.headline && (
          <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-ink">
            {profile.headline}
          </p>
        )}
        <div className="mt-7">
          <NarrationPlayer slug={person.slug} name={person.name} />
        </div>
      </header>

      {profile ? (
        <article className="pt-10">
          <Section title="Overview">
            <Prose text={profile.overview} sources={sourceMap} />
          </Section>

          {profile.earlyLife && (
            <Section title="Early Life & Path">
              <Prose text={profile.earlyLife} sources={sourceMap} />
            </Section>
          )}

          {profile.timeline?.length > 0 && (
            <Section title="Career Timeline">
              <ol className="space-y-3">
                {profile.timeline.map((t, i) => (
                  <li key={i} className="grid grid-cols-[4.5rem_1fr] gap-4">
                    <span className="font-mono text-sm tabular-nums text-accent">
                      {t.year}
                    </span>
                    <span className="leading-relaxed text-ink">
                      <Cited text={t.event} sources={sourceMap} />
                    </span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {profile.keyVentures?.length > 0 && (
            <Section title="Key Ventures & Innovations">
              <ul className="space-y-4">
                {profile.keyVentures.map((v, i) => (
                  <li key={i}>
                    <h4 className="font-display text-lg text-ink">{v.title}</h4>
                    <p className="mt-1 leading-relaxed text-muted">
                      <Cited text={v.detail} sources={sourceMap} />
                    </p>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {profile.notableQuote && (
            <figure className="my-12 border-l-2 border-accent pl-6">
              <blockquote className="font-display text-2xl italic leading-snug text-ink">
                “{profile.notableQuote.quote}”
              </blockquote>
              <figcaption className="mt-3 text-sm text-muted">
                {profile.notableQuote.context}
              </figcaption>
            </figure>
          )}

          {(profile.excerpts?.length ?? 0) > 0 && (
            <Section title="From the Record">
              <div className="space-y-7">
                {profile.excerpts!.map((ex, i) => (
                  <ExcerptBlock key={i} excerpt={ex} sources={sourceMap} />
                ))}
              </div>
            </Section>
          )}

          {profile.lessons?.length > 0 && (
            <Section title="What Operators Can Learn">
              <ul className="space-y-4">
                {profile.lessons.map((l, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-1 font-mono text-sm text-accent tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h4 className="font-display text-lg text-ink">{l.title}</h4>
                      <p className="mt-1 leading-relaxed text-muted">
                        <Cited text={l.detail} sources={sourceMap} />
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {profile.legacy && (
            <Section title="Legacy">
              <Prose text={profile.legacy} sources={sourceMap} />
            </Section>
          )}

          {(profile.furtherReading?.length ?? 0) > 0 && (
            <section className="mt-12 border-t border-ink pt-6">
              <h3 className="eyebrow">Further Reading</h3>
              <ul className="mt-4 space-y-4">
                {profile.furtherReading!.map((b, i) => (
                  <li key={i} className="leading-relaxed">
                    <p className="text-ink">
                      <span className="italic">{b.title}</span>
                      <span className="text-muted">
                        {", "}
                        {b.author}
                        {b.year ? ` (${b.year})` : ""}
                      </span>
                    </p>
                    {b.note && (
                      <p className="mt-0.5 text-sm text-muted">{b.note}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {profile.sources?.length > 0 && (
            <section className="mt-12 border-t border-ink pt-6">
              <h3 className="eyebrow">Sources</h3>
              <ol className="mt-4 space-y-2.5">
                {profile.sources.map((s) => (
                  <li
                    key={s.id}
                    id={`source-${s.id}`}
                    className="grid grid-cols-[1.75rem_1fr] gap-2 text-sm leading-relaxed scroll-mt-20"
                  >
                    <span className="font-mono text-accent tabular-nums">
                      {s.id}.
                    </span>
                    <SourceCitation source={s} />
                  </li>
                ))}
              </ol>
            </section>
          )}

          {profile.generatedAt && (
            <p className="mt-8 text-xs text-muted">
              Researched and written with Claude + live web search.
            </p>
          )}
        </article>
      ) : (
        <PendingProfile name={person.name} />
      )}
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h3 className="eyebrow mb-3">{title}</h3>
      {children}
    </section>
  );
}

/** A verbatim passage from a book or newspaper archive, with attribution. */
function ExcerptBlock({
  excerpt,
  sources,
}: {
  excerpt: Excerpt;
  sources: Map<number, Source>;
}) {
  const src = excerpt.sourceId ? sources.get(excerpt.sourceId) : undefined;
  return (
    <figure className="border-l-2 border-rule pl-5">
      <blockquote className="font-body text-[1.05rem] leading-relaxed text-ink">
        “{excerpt.text}”
      </blockquote>
      <figcaption className="mt-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">
        {src ? (
          <a href={`#source-${src.id}`} className="hover:text-accent">
            {excerpt.attribution}
          </a>
        ) : (
          <>{excerpt.attribution}</>
        )}
      </figcaption>
    </figure>
  );
}

/** A single bibliography entry, formatted by source type. */
function SourceCitation({ source: s }: { source: Source }) {
  // Title is italic for long-form works (books/journals), roman+quoted for articles.
  const isWork = s.type === "book" || s.type === "journal";
  const titleEl = isWork ? (
    <span className="italic">{s.title}</span>
  ) : (
    <span>“{s.title}”</span>
  );
  const meta = [
    s.publisher,
    s.year,
    s.pages,
    s.type !== "web" ? s.type : undefined,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <span className="text-muted">
      {s.author ? `${s.author}, ` : ""}
      {s.url ? (
        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink underline decoration-rule underline-offset-2 hover:decoration-accent"
        >
          {titleEl}
        </a>
      ) : (
        <span className="text-ink">{titleEl}</span>
      )}
      {meta ? `, ${meta}` : ""}
    </span>
  );
}

/** Multi-paragraph prose, paragraphs split on blank lines, with [n] citations. */
function Prose({
  text,
  sources,
}: {
  text: string;
  sources: Map<number, Source>;
}) {
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  return (
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-[1.05rem] leading-relaxed text-ink">
          <Cited text={p} sources={sources} />
        </p>
      ))}
    </div>
  );
}

/** Render text, converting [n] markers into superscript links to the source list. */
function Cited({
  text,
  sources,
}: {
  text: string;
  sources: Map<number, Source>;
}) {
  const parts = text.split(/(\[\d+(?:,\s*\d+)*\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+(?:,\s*\d+)*)\]$/);
        if (!match) return <span key={i}>{part}</span>;
        const ids = match[1].split(/,\s*/).map(Number);
        return (
          <sup key={i} className="cite ml-0.5 text-[0.7em]">
            [
            {ids.map((id, j) => {
              const known = sources.has(id);
              return (
                <span key={id}>
                  {j > 0 && ","}
                  {known ? (
                    <a
                      href={`#source-${id}`}
                      className="text-accent hover:underline"
                    >
                      {id}
                    </a>
                  ) : (
                    id
                  )}
                </span>
              );
            })}
            ]
          </sup>
        );
      })}
    </>
  );
}

function PendingProfile({ name }: { name: string }) {
  return (
    <div className="pt-12">
      <p className="text-lg leading-relaxed text-muted">
        {name}&apos;s full profile hasn&apos;t been generated yet. Run{" "}
        <code className="rounded bg-paper-2 px-1.5 py-0.5 font-mono text-sm text-ink">
          node scripts/generate-profiles.mjs --only {name}
        </code>{" "}
        to research and write it.
      </p>
    </div>
  );
}
