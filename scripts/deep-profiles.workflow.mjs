export const meta = {
  name: 'deep-profiles',
  description: 'Deep-research & write archival-quality industrialist profiles (books, newspaper archives, primary sources) into data/profiles/<slug>.json',
  phases: [{ title: 'Research & Write', detail: 'one agent per industrialist: web research -> profile JSON' }],
}

// args = array of { slug, name, company, years, sector } (everyone except henry-ford,
// which ships hand-written as the gold-standard template the agents read for format).
const ROOT = '/Users/aryamaanlakhotia/Desktop/founder-profiles'
const PEOPLE = [
  {
    "slug": "j-chadbourn-bolles",
    "name": "J. Chadbourn Bolles",
    "company": "Chadbourn",
    "years": "1936–1970",
    "sector": "Fabric and Apparel"
  },
  {
    "slug": "hattie-carnegie",
    "name": "Hattie Carnegie",
    "company": "Hattie Carnegie",
    "years": "1909–1956",
    "sector": "Fabric and Apparel"
  },
  {
    "slug": "elisabeth-claiborne",
    "name": "Elisabeth Claiborne",
    "company": "Liz Claiborne",
    "years": "1976–1989",
    "sector": "Fabric and Apparel"
  },
  {
    "slug": "sidney-w-winslow",
    "name": "Sidney W. Winslow",
    "company": "United Shoe Machinery Company",
    "years": "1899–1917",
    "sector": "Fabric and Apparel"
  },
  {
    "slug": "whitney-stevens",
    "name": "Whitney Stevens",
    "company": "J. P. Stevens and Company",
    "years": "1979–1988",
    "sector": "Fabric and Apparel"
  },
  {
    "slug": "ralph-lauren",
    "name": "Ralph Lauren",
    "company": "Ralph Lauren Corporation",
    "years": "1967–Present",
    "sector": "Fabric and Apparel"
  },
  {
    "slug": "james-s-love",
    "name": "James S. Love",
    "company": "Burlington Industries",
    "years": "1923–1948",
    "sector": "Fabric and Apparel"
  },
  {
    "slug": "charles-h-steinway",
    "name": "Charles H. Steinway",
    "company": "Steinway and Sons",
    "years": "1896–1919",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "milton-bradley",
    "name": "Milton Bradley",
    "company": "Milton Bradley Company",
    "years": "1864–1911",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "arde-bulova",
    "name": "Arde Bulova",
    "company": "Bulova Watch Company",
    "years": "1930–1958",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "charles-l-coughlin",
    "name": "Charles L. Coughlin",
    "company": "Briggs & Stratton Corporation",
    "years": "1935–1970",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "george-eastman",
    "name": "George Eastman",
    "company": "Eastman Kodak Company",
    "years": "1881–1923",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "william-a-fairburn",
    "name": "William A. Fairburn",
    "company": "Diamond Match Company",
    "years": "1915–1947",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "herman-g-fisher",
    "name": "Herman G. Fisher",
    "company": "Fisher-Price Toy Company",
    "years": "1930–1966",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "ray-w-herrick",
    "name": "Ray W. Herrick",
    "company": "Tecumseh Products",
    "years": "1930–1972",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "edwin-h-land",
    "name": "Edwin H. Land",
    "company": "Polaroid Corporation",
    "years": "1937–1980",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "james-j-ling",
    "name": "James J. Ling",
    "company": "Ling-Temco-Vought",
    "years": "1946–1970",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "royal-little",
    "name": "Royal Little",
    "company": "Textron",
    "years": "1923–1960",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "morton-l-mandel",
    "name": "Morton L. Mandel",
    "company": "Premier Industrial Corporation",
    "years": "1958–1996",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "leroy-a-petersen",
    "name": "LeRoy A. Petersen",
    "company": "Otis Elevator Company",
    "years": "1945–1966",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "charles-a-coffin",
    "name": "Charles A. Coffin",
    "company": "General Electric Company",
    "years": "1892–1913",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "john-c-bogle",
    "name": "John C. Bogle",
    "company": "The Vanguard Group",
    "years": "1974–1995",
    "sector": "Finance"
  },
  {
    "slug": "alan-c-greenberg",
    "name": "Alan C. Greenberg",
    "company": "Bear Stearns Companies",
    "years": "1978–1993",
    "sector": "Finance"
  },
  {
    "slug": "charles-e-merrill",
    "name": "Charles E. Merrill",
    "company": "Merrill Lynch & Company",
    "years": "1940–1956",
    "sector": "Finance"
  },
  {
    "slug": "andre-meyer",
    "name": "Andre Meyer",
    "company": "Lazard, Freres and Company",
    "years": "1943–1979",
    "sector": "Finance"
  },
  {
    "slug": "samuel-sachs",
    "name": "Samuel Sachs",
    "company": "Goldman, Sachs and Company",
    "years": "1904–1928",
    "sector": "Finance"
  },
  {
    "slug": "philip-lehman",
    "name": "Philip Lehman",
    "company": "Lehman Brothers and Company",
    "years": "1901–1925",
    "sector": "Finance"
  },
  {
    "slug": "adolphus-busch",
    "name": "Adolphus Busch",
    "company": "Anheuser-Busch Brewery",
    "years": "1880–1913",
    "sector": "Food and Tobacco"
  },
  {
    "slug": "james-b-duke",
    "name": "James B. Duke",
    "company": "American Tobacco Company",
    "years": "1890–1912",
    "sector": "Food and Tobacco"
  },
  {
    "slug": "will-k-kellogg",
    "name": "Will K. Kellogg",
    "company": "Kellogg Company",
    "years": "1906–1939",
    "sector": "Food and Tobacco"
  },
  {
    "slug": "robert-g-mondavi",
    "name": "Robert G. Mondavi",
    "company": "Robert Mondavi Winery",
    "years": "1966–1990",
    "sector": "Food and Tobacco"
  },
  {
    "slug": "joy-morton",
    "name": "Joy Morton",
    "company": "Morton Salt Company",
    "years": "1885–1934",
    "sector": "Food and Tobacco"
  },
  {
    "slug": "andrew-w-preston",
    "name": "Andrew W. Preston",
    "company": "United Fruit Company",
    "years": "1882–1924",
    "sector": "Food and Tobacco"
  },
  {
    "slug": "margaret-f-rudkin",
    "name": "Margaret F. Rudkin",
    "company": "Pepperidge Farm",
    "years": "1937–1960",
    "sector": "Food and Tobacco"
  },
  {
    "slug": "elbridge-a-stuart",
    "name": "Elbridge A. Stuart",
    "company": "Carnation Company",
    "years": "1901–1932",
    "sector": "Food and Tobacco"
  },
  {
    "slug": "william-wrigley-jr",
    "name": "William Wrigley, Jr.",
    "company": "William Wrigley Jr. Company",
    "years": "1892–1925",
    "sector": "Food and Tobacco"
  },
  {
    "slug": "leonard-abramson",
    "name": "Leonard Abramson",
    "company": "US Healthcare",
    "years": "1975–1996",
    "sector": "Healthcare"
  },
  {
    "slug": "arnold-o-beckman",
    "name": "Arnold O. Beckman",
    "company": "Beckman Instruments",
    "years": "1935–1982",
    "sector": "Healthcare"
  },
  {
    "slug": "eugene-n-beesley",
    "name": "Eugene N. Beesley",
    "company": "Eli Lilly & Company",
    "years": "1969–1973",
    "sector": "Healthcare"
  },
  {
    "slug": "francis-c-brown",
    "name": "Francis C. Brown",
    "company": "Schering Corporation",
    "years": "1943–1966",
    "sector": "Healthcare"
  },
  {
    "slug": "john-w-brown",
    "name": "John W. Brown",
    "company": "Stryker Corporation",
    "years": "1977–2004",
    "sector": "Healthcare"
  },
  {
    "slug": "richard-l-gelb",
    "name": "Richard L. Gelb",
    "company": "Bristol-Myers Squibb Company",
    "years": "1972–1994",
    "sector": "Healthcare"
  },
  {
    "slug": "william-b-graham",
    "name": "William B. Graham",
    "company": "Baxter International",
    "years": "1953–1980",
    "sector": "Healthcare"
  },
  {
    "slug": "alfred-e-mann",
    "name": "Alfred E. Mann",
    "company": "Pacesetter",
    "years": "1972–1985",
    "sector": "Healthcare"
  },
  {
    "slug": "james-a-farrell",
    "name": "James A. Farrell",
    "company": "United States Steel Corporation",
    "years": "1911–1932",
    "sector": "Metals"
  },
  {
    "slug": "eugene-g-grace",
    "name": "Eugene G. Grace",
    "company": "Bethlehem Steel Corporation",
    "years": "1916–1957",
    "sector": "Metals"
  },
  {
    "slug": "f-kenneth-iverson",
    "name": "F. Kenneth Iverson",
    "company": "Nucor Corporation",
    "years": "1965–1996",
    "sector": "Metals"
  },
  {
    "slug": "robert-c-stanley",
    "name": "Robert C. Stanley",
    "company": "International Nickel Corporation",
    "years": "1922–1951",
    "sector": "Metals"
  },
  {
    "slug": "elizabeth-arden",
    "name": "Elizabeth Arden",
    "company": "Elizabeth Arden Company",
    "years": "1910–1966",
    "sector": "Personal Care and Home Products"
  },
  {
    "slug": "mary-kay-ash",
    "name": "Mary Kay Ash",
    "company": "Mary Kay Cosmetics",
    "years": "1963–1987",
    "sector": "Personal Care and Home Products"
  },
  {
    "slug": "william-c-procter",
    "name": "William C. Procter",
    "company": "Procter & Gamble Company",
    "years": "1907–1930",
    "sector": "Personal Care and Home Products"
  },
  {
    "slug": "richard-m-devos",
    "name": "Richard M. DeVos",
    "company": "Amway Corporation",
    "years": "1959–1992",
    "sector": "Personal Care and Home Products"
  },
  {
    "slug": "max-factor-jr",
    "name": "Max (Francis) Factor, Jr.",
    "company": "Max Factor Company",
    "years": "1938–1973",
    "sector": "Personal Care and Home Products"
  },
  {
    "slug": "alfred-c-fuller",
    "name": "Alfred C. Fuller",
    "company": "Fuller Brush Company",
    "years": "1906–1943",
    "sector": "Personal Care and Home Products"
  },
  {
    "slug": "anthony-overton",
    "name": "Anthony Overton",
    "company": "Hygienic Manufacturing Company",
    "years": "1898–1946",
    "sector": "Personal Care and Home Products"
  },
  {
    "slug": "estee-lauder",
    "name": "Estee Lauder",
    "company": "Estee Lauder",
    "years": "1946–1982",
    "sector": "Personal Care and Home Products"
  },
  {
    "slug": "helena-rubinstein",
    "name": "Helena Rubinstein",
    "company": "Helena Rubinstein",
    "years": "1915–1965",
    "sector": "Personal Care and Home Products"
  },
  {
    "slug": "jay-van-andel",
    "name": "Jay Van Andel",
    "company": "Amway Corporation",
    "years": "1959–1992",
    "sector": "Personal Care and Home Products"
  }
]

const people = (Array.isArray(args) && args.length) ? args : PEOPLE
if (!people.length) {
  log('No people passed via args — nothing to do.')
  return { written: 0 }
}

const STATUS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    slug: { type: 'string' },
    ok: { type: 'boolean' },
    sources: { type: 'integer', description: 'number of sources in the written file' },
    books: { type: 'integer', description: 'number of type:book sources' },
    excerpts: { type: 'integer' },
    note: { type: 'string', description: 'short status or error note' },
  },
  required: ['slug', 'ok', 'sources', 'books', 'excerpts', 'note'],
}

function prompt(p) {
  return `You are writing an ARCHIVAL-QUALITY profile of ${p.name}, the leader/founder associated with ${p.company} (active ${p.years}; sector: ${p.sector}). The bar is a chapter in a serious business history or a long-form magazine feature — emphatically NOT a Wikipedia rewrite.

STEP 0 — SKIP IF DONE. Run with Bash: \`node -e "const p=require('${ROOT}/data/profiles/${p.slug}.json'); if((p.sources||[]).length>=8 && (p.excerpts||[]).length>=2) {console.log('DONE',p.sources.length,p.excerpts.length)} else process.exit(3)"\` . If it prints DONE, the profile already exists and meets the bar — STOP immediately and return {slug, ok:true, sources, books (count type:book), excerpts, note:"already existed"} without researching or writing anything. Otherwise continue.

STEP 1 — STUDY THE TEMPLATE.
Read ${ROOT}/data/profiles/henry-ford.json. That hand-written file is the EXACT JSON shape, citation style, depth, tone, and source quality you must match. Mirror its structure precisely.

STEP 2 — RESEARCH DEEPLY with the WebSearch and WebFetch tools. Do MANY rounds — keep going until you have genuinely deep, specific material. Deliberately hunt these source types and CITE them:
- DEFINITIVE BOOKS: the canonical biography/biographies and company histories (author, title, year, publisher). Search Google Books and archive.org for specific facts, scenes, dollar figures, and VERBATIM quotable passages. Capture exact wording + page when you can.
- NEWSPAPER / PERIODICAL ARCHIVES: contemporary coverage (NYT, WSJ, regional papers, Time, Fortune, BusinessWeek, trade press), with the publication name and DATE. Find the original announcement of key events, a lifetime profile, and the obituary.
- PRIMARY / ARCHIVE SOURCES: the subject's own memoirs/letters/speeches/shareholder letters, company or museum/historical-society archives, oral histories, SEC filings, patents, court records.
- SCHOLARSHIP: HBS/business-school cases, academic journal articles, university-press histories.
Wikipedia/Britannica/History.com may be used only as a starting index to FIND better sources; they should be a small minority of your citations, if used at all.

HARD REQUIREMENTS for the finished profile:
- sources: at least 8 entries. At least 3 of type "book" (real, named, with author+year). At least 1 of type "newspaper" (or "journal") WITH a date. At least 1 of type "archive" (primary/archival/court/museum). Set each source's "type" to one of book|newspaper|journal|archive|interview|web and fill author/publisher/year/pages/url whenever known. Include "url" ONLY when it is a real URL you actually retrieved; OMIT url for books/archives that have none. Never invent a URL.
- excerpts: 2–4 VERBATIM passages copied EXACTLY from a book or newspaper (the kind of line that makes a reader stop), each with full "attribution" and a "sourceId" pointing to the matching sources entry. Never paraphrase into this field.
- furtherReading: 3–6 canonical real books (author, title, year, one-line note).
- overview: 4–6 substantial paragraphs (blank-line separated). earlyLife: 2–3 paragraphs. legacy: 2–3 paragraphs. timeline: 8–14 dated milestones. keyVentures: 3–6. lessons: 3–5.
- Inline [n] citations in overview, earlyLife, timeline events, keyVentures details, and legacy. EVERY [n] must correspond to a sources entry with the same id. Be specific: real names, dates, dollar figures, conflicts, scenes.
- notableQuote: a genuine, verifiable quote (or null if none is verifiable). narrationScript: 130–180 words of warm spoken prose, no [n] markers, no headings.
- Set "slug" to "${p.slug}" and "generatedAt" to "2026-06-06T00:00:00.000Z".

ACCURACY: Do NOT invent facts, quotations, page numbers, sources, or URLs. If something is uncertain, omit it. Cross-check dates against the (${p.years}) hint.

STEP 3 — WRITE THE FILE. Write the complete JSON to ${ROOT}/data/profiles/${p.slug}.json using the Write tool. It must be valid JSON matching the template's shape.

STEP 4 — VERIFY. Run \`node -e "JSON.parse(require('fs').readFileSync('${ROOT}/data/profiles/${p.slug}.json','utf8'))"\` with Bash to confirm it parses; also confirm every inline [n] and every excerpt.sourceId maps to a sources id. Fix and rewrite if not.

Then return the status object describing what you wrote.`
}

phase('Research & Write')

const results = await parallel(
  people.map((p) => () =>
    agent(prompt(p), {
      label: p.slug,
      phase: 'Research & Write',
      agentType: 'general-purpose',
      schema: STATUS,
    }),
  ),
)

const done = results.filter(Boolean)
const ok = done.filter((r) => r.ok)
const weak = ok.filter((r) => r.sources < 8 || r.books < 3 || r.excerpts < 2)
log(`Wrote ${ok.length}/${people.length} profiles. ${weak.length} below the source/excerpt bar.`)

return {
  requested: people.length,
  written: ok.length,
  failed: people.filter((p) => !done.find((r) => r.slug === p.slug && r.ok)).map((p) => p.slug),
  belowBar: weak.map((r) => ({ slug: r.slug, sources: r.sources, books: r.books, excerpts: r.excerpts })),
}
