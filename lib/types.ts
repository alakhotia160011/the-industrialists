export type Industrialist = {
  slug: string;
  name: string;
  company: string;
  years: string;
  sector: string;
  tagline?: string;
};

export type IndustrialistData = {
  sectorOrder: string[];
  people: Industrialist[];
};

export type TimelineEntry = {
  year: string;
  event: string;
};

export type KeyVenture = {
  title: string;
  detail: string;
};

export type Lesson = {
  title: string;
  detail: string;
};

export type Quote = {
  quote: string;
  context: string;
};

export type SourceType =
  | "book"
  | "newspaper"
  | "journal"
  | "archive"
  | "interview"
  | "web";

export type Source = {
  /** Stable numeric id used for inline [n] references. */
  id: number;
  /** What kind of source this is — drives how it's rendered in the bibliography. */
  type: SourceType;
  /** Title of the work (book), article, or document. */
  title: string;
  /** Author(s) or reporter, when attributable. */
  author?: string;
  /** Publisher, newspaper, journal, or archive name. */
  publisher?: string;
  /** Publication year or full date (e.g. "1954" or "Jan. 6, 1914"). */
  year?: string;
  /** Page, chapter, or volume reference (e.g. "pp. 447–460", "ch. 12"). */
  pages?: string;
  /** Optional — books and physical archives often have no stable URL. */
  url?: string;
};

/** A canonical book/work on the subject, for the "Further Reading" shelf. */
export type FurtherReading = {
  author: string;
  title: string;
  year: string;
  /** One line on what it is and why it matters. */
  note: string;
};

/** A verbatim passage lifted from a book or newspaper archive. */
export type Excerpt = {
  /** The quoted passage itself. */
  text: string;
  /** e.g. "Allan Nevins, Ford: The Times, the Man, the Company (1954), p. 452". */
  attribution: string;
  /** Optional link back to the numbered source it came from. */
  sourceId?: number;
};

/** A generated, web-research-backed profile (data/profiles/<slug>.json). */
export type Profile = {
  slug: string;
  /** One-line editorial summary. */
  headline: string;
  /** Multi-paragraph narrative; paragraphs separated by blank lines. */
  overview: string;
  earlyLife: string;
  timeline: TimelineEntry[];
  keyVentures: KeyVenture[];
  lessons: Lesson[];
  legacy: string;
  notableQuote: Quote | null;
  /** Verbatim passages from books/newspapers that bring the record to life. */
  excerpts?: Excerpt[];
  /** Canonical books on the subject — the scholarly shelf. */
  furtherReading?: FurtherReading[];
  /** Conversational 60–90s script written to be read aloud. */
  narrationScript: string;
  sources: Source[];
  /** ISO timestamp stamped by the generation script. */
  generatedAt: string;
};
