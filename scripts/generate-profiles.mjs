#!/usr/bin/env node
// Deep-research profile generator.
//
// For each industrialist this runs TWO Claude calls:
//   1. Research, claude-opus-4-8 + server-side web_search, doing several rounds
//                  of searching and producing a sourced dossier.
//   2. Structure, claude-opus-4-8 (no tools) with output_config.format, turning the
//                  dossier into the exact data/profiles/<slug>.json shape, with
//                  inline [n] citations tied to a numbered sources list.
//
// The two-step split is deliberate: web search attaches citations to the response,
// and citations can't be combined with structured outputs in one call.
//
// Usage:
//   node scripts/generate-profiles.mjs                # all, skip already-generated
//   node scripts/generate-profiles.mjs --limit 3      # first 3 missing
//   node scripts/generate-profiles.mjs --only ford    # one person (slug or name match)
//   node scripts/generate-profiles.mjs --force        # regenerate even if file exists
//   node scripts/generate-profiles.mjs --model claude-sonnet-4-6   # cost-down lever

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PROFILES_DIR = path.join(ROOT, "data", "profiles");

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const has = (name) => args.includes(name);

const MODEL = flag("--model") || "claude-opus-4-8";
const LIMIT = flag("--limit") ? parseInt(flag("--limit"), 10) : Infinity;
const ONLY = flag("--only");
const FORCE = has("--force");

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("✗ ANTHROPIC_API_KEY is not set. Export it and retry.");
  process.exit(1);
}

const client = new Anthropic();

const { people } = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "industrialists.json"), "utf8"),
);

fs.mkdirSync(PROFILES_DIR, { recursive: true });

// ---- JSON schema for the structuring turn -------------------------------------

const PROFILE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    headline: { type: "string", description: "One-sentence editorial summary." },
    overview: {
      type: "string",
      description:
        "4–6 substantial paragraphs (separated by blank lines) covering who they were, what they built, how they ran it, the conflicts and controversies, and why it mattered. Draw on the named biographies and archival reporting in the dossier, specific, concrete, and analytical, not a Wikipedia summary. Use inline [n] citations on every factual claim.",
    },
    earlyLife: {
      type: "string",
      description: "2–3 paragraphs on family, formation, education, and the road to their company, with the telling specific details a good biography would include. Use [n] citations.",
    },
    timeline: {
      type: "array",
      description: "8–14 chronological milestones.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          year: { type: "string" },
          event: { type: "string", description: "One sentence. Add [n] where appropriate." },
        },
        required: ["year", "event"],
      },
    },
    keyVentures: {
      type: "array",
      description: "3–6 signature ventures, products, or strategic moves.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          detail: { type: "string", description: "2–3 sentences with [n] citations." },
        },
        required: ["title", "detail"],
      },
    },
    lessons: {
      type: "array",
      description: "3–5 durable lessons for today's founders/operators.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
        },
        required: ["title", "detail"],
      },
    },
    legacy: {
      type: "string",
      description: "2–3 paragraphs on lasting impact and how historians/the record assess them. Use [n] citations.",
    },
    excerpts: {
      type: "array",
      description:
        "2–4 VERBATIM passages quoted from books or newspaper archives that vividly capture the subject (the kind of quotation that makes a reader stop). Quote exactly; never paraphrase into this field. Empty array only if no quotable passage was found.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          text: { type: "string", description: "The exact quoted passage." },
          attribution: {
            type: "string",
            description:
              "Full attribution, e.g. \"Allan Nevins, Ford: The Times, the Man, the Company (1954), p. 452\" or \"The New York Times, Jan. 6, 1914\".",
          },
          sourceId: {
            type: "integer",
            description: "id of the matching entry in the sources array.",
          },
        },
        required: ["text", "attribution", "sourceId"],
      },
    },
    furtherReading: {
      type: "array",
      description:
        "3–6 canonical books/works on the subject, the definitive biographies and business histories a serious reader should pick up. Real titles only.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          author: { type: "string" },
          title: { type: "string" },
          year: { type: "string" },
          note: { type: "string", description: "One line on what it is and why it matters." },
        },
        required: ["author", "title", "year", "note"],
      },
    },
    notableQuote: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: {
            quote: { type: "string" },
            context: { type: "string", description: "Who/when/where, briefly." },
          },
          required: ["quote", "context"],
        },
        { type: "null" },
      ],
    },
    narrationScript: {
      type: "string",
      description:
        "A warm, conversational 130–180 word script written to be READ ALOUD by a narrator. No citation markers, no headers, just flowing spoken prose that tells their story.",
    },
    sources: {
      type: "array",
      description:
        "Every source referenced by an [n] marker, numbered to match. Favor books, newspaper archives, journals, and primary documents over general web pages. Include author/year/pages whenever known. URLs only when real (books and physical archives may have none).",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "integer" },
          type: {
            type: "string",
            enum: ["book", "newspaper", "journal", "archive", "interview", "web"],
            description: "The kind of source.",
          },
          title: { type: "string", description: "Book title, article headline, or document name." },
          author: { type: "string", description: "Author(s) or reporter, if known." },
          publisher: { type: "string", description: "Publisher, newspaper, journal, or archive." },
          year: { type: "string", description: "Year or full date, e.g. \"1954\" or \"Jan. 6, 1914\"." },
          pages: { type: "string", description: "Page/chapter/volume reference, if applicable." },
          url: { type: "string", description: "Real URL only; omit for books/archives without one." },
        },
        required: ["id", "type", "title"],
      },
    },
  },
  required: [
    "headline",
    "overview",
    "earlyLife",
    "timeline",
    "keyVentures",
    "lessons",
    "legacy",
    "excerpts",
    "furtherReading",
    "notableQuote",
    "narrationScript",
    "sources",
  ],
};

// ---- Step 1: research with web search -----------------------------------------

async function research(person) {
  const userQuery = `Research ${person.name}, the leader/founder associated with ${person.company} (active ${person.years}). I am building a deeply-sourced, archival-quality profile for a serious audience. The bar is a long-form magazine feature or a chapter in a business history, NOT a Wikipedia rewrite. Wikipedia/Britannica/History.com may be used only as a starting index to find better sources; they should be the minority of what you cite.

Do MANY rounds of web searches, keep going until you have genuinely deep material. Deliberately seek out, and cite, these source types:
- DEFINITIVE BIOGRAPHIES & BUSINESS HISTORIES: Identify the canonical book(s) on this person/company (author, title, year). Search Google Books, archive.org, and reviews for specific facts, anecdotes, and VERBATIM quotable passages, capture exact wording with author/title/page where you can.
- NEWSPAPER & PERIODICAL ARCHIVES: contemporary coverage from The New York Times, Wall Street Journal, regional papers, Time, Fortune, BusinessWeek, trade press, etc. Note the publication and DATE. Look for the original announcement of key events, profiles written in their lifetime, and the obituary.
- PRIMARY SOURCES: the subject's own memoirs/letters/speeches/shareholder letters, company archives, museum/historical-society holdings, oral histories, SEC filings, patents, court records.
- SCHOLARSHIP: business-school cases (HBS), academic journal articles, university press histories.

For each, capture: who said it, when, where, and the exact citation (author, work, year, page or date). Prefer specific, concrete, vivid detail (named people, dollar figures, dates, scenes, conflicts) over generalities.

Investigate thoroughly:
- Family, formation, education, and the path to ${person.company}, with telling specifics
- The founding/takeover story and how they actually built and ran the company day to day
- A detailed chronological timeline (specific years/dates)
- Signature ventures, products, innovations, financial and strategic moves
- Leadership style, rivalries, controversies, failures, labor/legal battles, and how they handled them
- Genuine VERBATIM quotations (theirs and contemporaries' about them), each with its exact source
- 2–4 striking quotable passages from books or newspaper archives, copied exactly
- Legacy and how historians assess them today

Cross-check dates against the (${person.years}) hint and flag any discrepancy.

Write a thorough research dossier organized by the topics above. Mark verbatim quotations clearly as QUOTE with full attribution. At the very end include two sections:
"## SOURCES": a numbered list, each line "Type | Author | Title | Publisher | Year/Date | Page | URL" (use "n/a" for unknown fields). Type ∈ {book, newspaper, journal, archive, interview, web}. Only include URLs you actually retrieved.
"## FURTHER READING": the 3–6 canonical books on this subject (author, title, year, one-line note), even if you couldn't read them in full.`;

  const messages = [{ role: "user", content: userQuery }];
  const discovered = [];
  let finalText = "";
  let continuations = 0;

  while (true) {
    const resp = await withRetry(() =>
      client.messages.create({
        model: MODEL,
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        output_config: { effort: "high" },
        tools: [{ type: "web_search_20260209", name: "web_search" }],
        messages,
      }),
    );

    // Collect any URLs surfaced by the search tool, as a backstop sources list.
    for (const block of resp.content) {
      if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
        for (const r of block.content) {
          if (r?.url) discovered.push({ title: r.title || r.url, url: r.url });
        }
      }
    }
    finalText = resp.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    if (resp.stop_reason === "pause_turn" && continuations < 6) {
      continuations++;
      messages.push({ role: "assistant", content: resp.content });
      continue;
    }
    break;
  }

  return { dossier: finalText, discovered };
}

// ---- Step 2: structure into the profile schema --------------------------------

async function structure(person, dossier, discovered) {
  const dedupSources = [...new Map(discovered.map((s) => [s.url, s])).values()]
    .slice(0, 40)
    .map((s, i) => `${i + 1}. ${s.title}, ${s.url}`)
    .join("\n");

  const prompt = `Below is a research dossier on ${person.name} (${person.company}, ${person.years}). Turn it into a structured profile that exactly matches the required JSON schema.

Rules:
- Base every claim on the dossier. Do not invent facts, quotations, page numbers, or sources. If something is uncertain, omit it.
- Write with depth and specificity, concrete names, dates, dollar figures, scenes, and conflicts. This should read like a business-history chapter, not an encyclopedia stub.
- Add inline citations as [n] markers in overview, earlyLife, timeline events, keyVentures details, and legacy. Each [n] must correspond to an entry in the "sources" array with the SAME id.
- Build the "sources" array from the dossier's SOURCES section: set each entry's "type" (book/newspaper/journal/archive/interview/web) and fill author/publisher/year/pages whenever the dossier gives them. Include "url" only when it is a real URL. Renumber 1..N and make inline markers match. Favor books, newspaper archives, and primary documents.
- "excerpts": copy 2–4 VERBATIM passages from the dossier (marked QUOTE) exactly as written, with full attribution and the matching sourceId. Never paraphrase into this field.
- "furtherReading": the canonical books from the dossier's FURTHER READING section.
- "narrationScript" must be plain spoken prose (no [n] markers, no headings).
- Never use em dashes (Unicode U+2014). Use commas, colons, parentheses, or separate sentences instead.

=== RESEARCH DOSSIER ===
${dossier}

=== URLS DISCOVERED DURING SEARCH (backstop for the sources array) ===
${dedupSources || "(none captured separately, use the dossier's SOURCES section)"}
`;

  const resp = await withRetry(() =>
    client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "high",
        format: { type: "json_schema", schema: PROFILE_SCHEMA },
      },
      messages: [{ role: "user", content: prompt }],
    }),
  );

  const text = resp.content.find((b) => b.type === "text")?.text ?? "";
  return JSON.parse(text);
}

// ---- helpers ------------------------------------------------------------------

async function withRetry(fn, tries = 4) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = err?.status;
      if (status && status >= 400 && status < 500 && status !== 429) throw err;
      const wait = Math.min(2000 * 2 ** i, 20000);
      console.warn(`  …retry ${i + 1}/${tries} after ${wait}ms (${err?.message ?? err})`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

// ---- main ---------------------------------------------------------------------

function selectPeople() {
  let list = people;
  if (ONLY) {
    const q = ONLY.toLowerCase();
    list = list.filter(
      (p) => p.slug.includes(q) || p.name.toLowerCase().includes(q),
    );
  }
  if (!FORCE) {
    list = list.filter(
      (p) => !fs.existsSync(path.join(PROFILES_DIR, `${p.slug}.json`)),
    );
  }
  return list.slice(0, LIMIT);
}

async function main() {
  const targets = selectPeople();
  if (targets.length === 0) {
    console.log("Nothing to generate (all selected profiles already exist; use --force).");
    return;
  }
  console.log(`Generating ${targets.length} profile(s) with ${MODEL}\n`);

  let ok = 0;
  for (const person of targets) {
    const t0 = Date.now();
    process.stdout.write(`• ${person.name} … `);
    try {
      const { dossier, discovered } = await research(person);
      const profile = await structure(person, dossier, discovered);
      profile.slug = person.slug;
      profile.generatedAt = new Date().toISOString();
      fs.writeFileSync(
        path.join(PROFILES_DIR, `${person.slug}.json`),
        JSON.stringify(profile, null, 2) + "\n",
      );
      ok++;
      const secs = ((Date.now() - t0) / 1000).toFixed(0);
      console.log(`✓ (${profile.sources?.length ?? 0} sources, ${secs}s)`);
    } catch (err) {
      console.log(`✗ ${err?.message ?? err}`);
    }
  }
  console.log(`\nDone: ${ok}/${targets.length} generated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
