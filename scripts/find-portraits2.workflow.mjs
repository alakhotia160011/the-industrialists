export const meta = {
  name: 'find-portraits-hard',
  description: 'Aggressive second-pass portrait hunt for the hardest 11 figures, more sources, any license (attributed), harder image-URL extraction',
  phases: [{ title: 'Hunt', detail: 'one agent per person, deep multi-source search' }],
}

const ROOT = '/Users/aryamaanlakhotia/Desktop/founder-profiles'
const UA = 'the-industrialists/1.0 (educational archive; ary.lakhotia@gmail.com)'
const PEOPLE = [
  {
    "slug": "joseph-p-routh",
    "name": "Joseph P. Routh",
    "company": "Pittston Company",
    "years": "1939–1976",
    "sector": "Agriculture and Mining"
  },
  {
    "slug": "henry-g-walter-jr",
    "name": "Henry G. Walter, Jr.",
    "company": "International Flavors & Fragrances",
    "years": "1962–1985",
    "sector": "Chemicals"
  },
  {
    "slug": "j-chadbourn-bolles",
    "name": "J. Chadbourn Bolles",
    "company": "Chadbourn",
    "years": "1936–1970",
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
    "slug": "arde-bulova",
    "name": "Arde Bulova",
    "company": "Bulova Watch Company",
    "years": "1930–1958",
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
    "slug": "leroy-a-petersen",
    "name": "LeRoy A. Petersen",
    "company": "Otis Elevator Company",
    "years": "1945–1966",
    "sector": "Fabricated Goods"
  },
  {
    "slug": "leonard-abramson",
    "name": "Leonard Abramson",
    "company": "US Healthcare",
    "years": "1975–1996",
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
    "slug": "richard-l-gelb",
    "name": "Richard L. Gelb",
    "company": "Bristol-Myers Squibb Company",
    "years": "1972–1994",
    "sector": "Healthcare"
  }
]

const RESULT = {
  type: 'object',
  additionalProperties: false,
  properties: {
    slug: { type: 'string' },
    found: { type: 'boolean' },
    sourcePage: { type: 'string' },
    imageUrl: { type: 'string' },
    license: { type: 'string' },
    free: { type: 'boolean' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    note: { type: 'string' },
  },
  required: ['slug', 'found', 'confidence', 'free', 'note'],
}

function prompt(p) {
  return `SECOND, AGGRESSIVE PASS. A first portrait search already FAILED to find this person, so dig much harder and more creatively now:
${p.name}, ${p.company} (active ${p.years}; ${p.sector}).

The goal is a real photographic portrait OF THIS EXACT PERSON, downloaded to disk. Copyright is acceptable for this educational archive as long as you record the source and license, so do NOT reject an image merely for being copyrighted; just report it.

Exhaust these avenues with WebSearch + WebFetch (try several, don't stop at the first miss):
- Wikimedia Commons under EVERY name variant (full given names, middle names, nicknames, with/without initials).
- Google Books / archive.org / HathiTrust scans of trade journals, company histories, "who's who" volumes, yearbooks, annual reports (great for pre-1960 execs), these often have a captioned photo you can screenshot/extract.
- Newspaper archives & obituaries: NYT (TimesMachine), Wall Street Journal, regional papers, Time/Fortune/Forbes/BusinessWeek (covers and profiles).
- Find A Grave, Geni, Prabook, NNDB, university/college Halls of Fame and alumni magazines, industry/trade association Halls of Fame, museum & historical-society collections, Library of Congress, Getty/AP/Bettmann historical (use a directly fetchable preview/thumbnail URL if the full is paywalled), company "past leaders"/history pages, foundation pages named after them.
- Image search: try the person's name + "portrait"/"photo"/"chairman"/"president" and inspect result pages for a direct image file.

IDENTITY IS CRITICAL, never use the wrong face. Confirm via dates/role/company that it's this individual; reject same-name strangers, relatives, logos, products, and group photos where they aren't clearly identifiable. If unsure, mark confidence low or found:false.

To DOWNLOAD: find a DIRECT image URL (…/file.jpg|.png|.webp). With WebFetch on a candidate page, ask it to return the URLs of any <img> showing the person. Then:
  curl -sL -A '${UA}' -o '${ROOT}/public/portraits/${p.slug}.<ext>' '<IMAGE_URL>'
Verify it is a real raster image > ~3KB:
  file '${ROOT}/public/portraits/${p.slug}.'* ; ls -l '${ROOT}/public/portraits/${p.slug}.'*
If it's HTML/SVG/too small/an icon, delete and try the next source. Save ~300–800px (not multi-MB).

Only set found:true if a confirmed image of THIS person is on disk. Otherwise found:false with a note on what you tried. slug must be "${p.slug}".`
}

phase('Hunt')
const results = await parallel(
  PEOPLE.map((p) => () =>
    agent(prompt(p), { label: p.slug, phase: 'Hunt', agentType: 'general-purpose', schema: RESULT }),
  ),
)
const r = results.filter(Boolean)
const found = r.filter((x) => x.found)
log(`Found ${found.length}/${PEOPLE.length}.`)
return {
  found: found.map((x) => ({ slug: x.slug, free: x.free, license: x.license, confidence: x.confidence, source: x.sourcePage })),
  notFound: r.filter((x) => !x.found).map((x) => x.slug),
}
