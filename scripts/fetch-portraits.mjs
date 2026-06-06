#!/usr/bin/env node
// Fetch a real lead portrait for each industrialist from Wikipedia and save it
// to public/portraits/<slug>.<ext>. Validates that the matched article is about
// a PERSON (not a company/brand) so we never show the wrong face — anyone we
// can't confidently match keeps the monogram placeholder.
//
//   node scripts/fetch-portraits.mjs --dry --sample   # preview matches, no writes
//   node scripts/fetch-portraits.mjs --dry            # preview all, no writes
//   node scripts/fetch-portraits.mjs                  # download all
//   node scripts/fetch-portraits.mjs --force          # re-fetch even if file exists

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "portraits");
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const FORCE = args.includes("--force");
const SAMPLE = args.includes("--sample");
const ONLY = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;

const UA = "the-industrialists/1.0 (educational profile archive; ary.lakhotia@gmail.com)";

// Manual corrections for namesakes/relatives the auto-matcher gets wrong.
// A string forces that exact Wikipedia article; null forces the monogram.
const OVERRIDES = {
  "james-b-duke": "James Buchanan Duke", // not his daughter Doris Duke
  "adolphus-busch": "Adolphus Busch", // founder, not grandson "Adolphus Busch III"
  "f-kenneth-iverson": null, // Nucor CEO has no article; avoid the APL computer scientist
  "charles-h-steinway": null, // no individual article; avoid wrong Steinway
  "whitney-stevens": null, // no article; avoid actor "Dan Stevens"
};
const BAD =
  /(company|companies|corporation|incorporated|\binc\b|\bco\b|brand|manufacturer|conglomerate|holding|organization|magazine|\bfilm\b|album|song|building|logo|trademark|winery|brewery|\bship\b|vessel|liberty ship|aircraft|locomotive|\baward\b|\bprize\b|school|university|college|\bpark\b|stadium|street|river|bridge|hospital|library|\bact\b|law)/i;
const GOOD =
  /(businessman|businesswoman|business ?person|executive|founder|co-founder|industrialist|entrepreneur|inventor|financier|banker|chemist|engineer|magnate|tycoon|designer|cosmetician|aviator|heir|philanthropist|merchant|\b1[6-9]\d\d\b|\b20[01]\d\b)/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const GENERIC =
  /^(the|and|of|company|companies|corporation|incorporated|inc|co|group|brothers|sons|and|&|watch|toy|salt|brush|motor|chemical|electric|products|industries|manufacturing|brewery|winery|associates|holdings|international|national|american|united|first)$/i;

const norm = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Tokens of a person's name, minus initials and Jr/Sr/III suffixes.
function nameParts(name) {
  const toks = norm(name).replace(/[(),.]/g, " ").split(/\s+/).filter(Boolean);
  const suffix = /^(jr|sr|ii|iii|iv)$/;
  const real = toks.filter((t) => t.length > 1 && !suffix.test(t));
  return { surname: real[real.length - 1], all: real, hasJr: /\bjr\b/i.test(name), hasSr: /\bsr\b/i.test(name) };
}
// Distinctive words from a company name (drop generic corporate words).
function companyTokens(company) {
  return norm(company).replace(/[(),.&]/g, " ").split(/\s+/).filter((t) => t.length >= 3 && !GENERIC.test(t));
}

async function getJSON(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" } });
    if (res.status === 429) { await sleep(1500 * (i + 1)); continue; }
    if (!res.ok) return null;
    try { return await res.json(); } catch { return null; }
  }
  return null;
}

// Use the summary thumbnail (~320px, tens of KB) — plenty for a ~96px portrait
// and always valid. The full-res original can be multiple MB, so it's only a
// last resort when no thumbnail exists.
function pickImage(s) {
  return s?.thumbnail?.source || s?.originalimage?.source || null;
}

async function summary(title) {
  return getJSON(
    "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title),
  );
}

async function searchOne(query) {
  const u =
    "https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=5&format=json&srsearch=" +
    encodeURIComponent(query);
  const d = await getJSON(u);
  return (d?.query?.search || []).map((s) => s.title);
}

// Name-first (so famous people surface above their company), then name+company
// as a fallback for the obscure ones. Merged, de-duped, name-only results first.
async function searchTitles(name, company) {
  const a = await searchOne(name);
  await sleep(120);
  const b = await searchOne(`${name} ${company}`);
  return [...new Set([...a, ...b])].slice(0, 8);
}

// Returns {title, desc, img} for the best person-match, or null.
// A match must: be about a person (not a company), have its SURNAME in the
// article title, and mention a distinctive word from the company — so an
// unrelated person who merely shares a name can't slip through.
async function findPortrait(name, company) {
  const { surname, all: nameToks, hasJr, hasSr } = nameParts(name);
  const coTokens = companyTokens(company);
  const titles = await searchTitles(name, company);
  await sleep(120);
  for (const t of titles) {
    const s = await summary(t);
    await sleep(120);
    if (!s) continue;
    const desc = s.description || "";
    const title = s.title || "";
    const blurb = norm(desc + " " + (s.extract || "").slice(0, 400) + " " + title);
    const img = pickImage(s);
    if (!img || /\.svg$/i.test(img)) continue; // logos are svg
    if (BAD.test(desc)) continue; // company/brand/place article
    if (!GOOD.test(desc + " " + (s.extract || "").slice(0, 200))) continue; // looks like a person
    if (surname && !norm(title).includes(surname)) continue; // title must carry the surname
    // generation guard: don't match Sr. when we want Jr. (or vice-versa)
    if (hasJr && /\bsr\.?\b/i.test(title)) continue;
    if (hasSr && /\bjr\.?\b/i.test(title)) continue;
    // Accept if the title is an exact full-name match (high confidence it's the
    // person), OR the article is tied to the company by a distinctive word.
    const titleClean = norm(title).replace(/\(.*?\)/g, " ");
    const exactName = nameToks.length >= 2 && nameToks.every((t) => titleClean.includes(t));
    const coMeaningful = coTokens.filter((c) => c !== surname);
    const tiedToCompany =
      !coMeaningful.length || coMeaningful.some((c) => blurb.includes(c));
    if (!exactName && !tiedToCompany) continue;
    return { title: s.title, desc, img };
  }
  return null;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return buf.length;
}

function extOf(url) {
  const m = url.toLowerCase().match(/\.(jpe?g|png|webp)(?:$|\?)/);
  return m ? (m[1] === "jpeg" ? "jpg" : m[1]) : "jpg";
}

async function main() {
  if (!DRY) fs.mkdirSync(OUT, { recursive: true });
  let people = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data", "industrialists.json"), "utf8"),
  ).people;
  if (SAMPLE) {
    const want = new Set([
      "henry-ford", "george-eastman", "john-w-brown", "francis-c-brown",
      "estee-lauder", "ralph-lauren", "mary-kay-ash", "anthony-overton",
      "helena-rubinstein", "max-factor-jr",
    ]);
    people = people.filter((p) => want.has(p.slug));
  }
  if (ONLY) people = people.filter((p) => ONLY.includes(p.slug));

  const found = [], missing = [];
  for (const p of people) {
    const existingFile = () =>
      fs.existsSync(OUT) ? fs.readdirSync(OUT).find((f) => f.startsWith(p.slug + ".")) : null;

    // Manual override: forced title, or null = force the monogram.
    if (Object.prototype.hasOwnProperty.call(OVERRIDES, p.slug)) {
      const ov = OVERRIDES[p.slug];
      const ex = existingFile();
      if (ov === null) {
        if (ex && !DRY) fs.unlinkSync(path.join(OUT, ex));
        missing.push(p.slug);
        console.log("·", p.name.padEnd(24), "→ monogram (override)");
        continue;
      }
      const s = await summary(ov);
      const img = pickImage(s);
      if (!img) { missing.push(p.slug); console.log("✗", p.name, "override had no image"); continue; }
      const ext = extOf(img);
      if (ex && !DRY && !ex.endsWith("." + ext)) fs.unlinkSync(path.join(OUT, ex));
      let size = 0;
      if (!DRY) { try { size = await download(img, path.join(OUT, `${p.slug}.${ext}`)); } catch (e) { missing.push(p.slug); console.log("✗", p.name, e.message); continue; } }
      found.push([p.slug, s.title]);
      console.log("✓", p.name.padEnd(24), "→", s.title, "(override)", DRY ? "" : `${(size / 1024) | 0}KB`);
      await sleep(150);
      continue;
    }

    const existing = existingFile();
    if (existing && !FORCE) { found.push([p.slug, "(exists)"]); continue; }

    const r = await findPortrait(p.name, p.company);
    if (!r) { missing.push(p.slug); console.log("·", p.name.padEnd(24), "→ NONE (monogram)"); continue; }
    const ext = extOf(r.img);
    const dest = path.join(OUT, `${p.slug}.${ext}`);
    let size = 0;
    if (!DRY) { try { size = await download(r.img, dest); } catch (e) { missing.push(p.slug); console.log("✗", p.name, e.message); continue; } }
    found.push([p.slug, r.title]);
    console.log("✓", p.name.padEnd(24), "→", r.title, `(${r.desc})`, DRY ? "" : `${(size / 1024) | 0}KB`);
    await sleep(150);
  }

  console.log(`\nMatched ${found.length}/${people.length}. Missing (${missing.length}): ${missing.join(", ") || "none"}`);
  if (!DRY) fs.writeFileSync(path.join(OUT, "_manifest.json"), JSON.stringify({ found, missing }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
