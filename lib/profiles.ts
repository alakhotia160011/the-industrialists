import fs from "node:fs";
import path from "node:path";
import data from "@/data/industrialists.json";
import type { Industrialist, IndustrialistData, Profile } from "@/lib/types";

const typed = data as IndustrialistData;

export function getAllPeople(): Industrialist[] {
  return typed.people;
}

export function getSectorOrder(): string[] {
  return typed.sectorOrder;
}

/** People grouped by sector, in the PDF's sector order. */
export function getPeopleBySector(): { sector: string; people: Industrialist[] }[] {
  return typed.sectorOrder
    .map((sector) => ({
      sector,
      people: typed.people.filter((p) => p.sector === sector),
    }))
    .filter((group) => group.people.length > 0);
}

export function getPerson(slug: string): Industrialist | undefined {
  return typed.people.find((p) => p.slug === slug);
}

// Stable accession number per person, in the order they appear in the archive.
const catalogIndex = new Map<string, number>(
  typed.people.map((p, i) => [p.slug, i + 1]),
);

/** Zero-padded catalogue number, e.g. "014". */
export function getCatalogNumber(slug: string): string {
  return String(catalogIndex.get(slug) ?? 0).padStart(3, "0");
}

const profilesDir = path.join(process.cwd(), "data", "profiles");

/** Load a generated profile from disk; returns null if it hasn't been generated yet. */
export function getProfile(slug: string): Profile | null {
  const file = path.join(profilesDir, `${slug}.json`);
  try {
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export function hasProfile(slug: string): boolean {
  return fs.existsSync(path.join(profilesDir, `${slug}.json`));
}

// Portraits fetched from Wikipedia live in public/portraits/<slug>.<ext>.
// Indexed once at build time; slugs with no real photo fall back to a monogram.
const portraitsDir = path.join(process.cwd(), "public", "portraits");
let portraitIndex: Map<string, string> | null = null;

function loadPortraits(): Map<string, string> {
  if (portraitIndex) return portraitIndex;
  portraitIndex = new Map();
  try {
    for (const file of fs.readdirSync(portraitsDir)) {
      const m = file.match(/^(.+)\.(jpe?g|png|webp)$/i);
      if (m) portraitIndex.set(m[1], file);
    }
  } catch {
    // no portraits dir yet — everyone uses the monogram
  }
  return portraitIndex;
}

/** Public path to a person's portrait image, or null if none was found. */
export function getPortrait(slug: string): string | null {
  const file = loadPortraits().get(slug);
  return file ? `/portraits/${file}` : null;
}
