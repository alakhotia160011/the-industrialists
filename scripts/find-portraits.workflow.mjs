export const meta = {
  name: 'find-portraits',
  description: 'Web-hunt a verified portrait photo for each industrialist still on a monogram, download it to public/portraits/<slug>.<ext>',
  phases: [{ title: 'Hunt', detail: 'one agent per person: search → confirm identity → download' }],
}

const ROOT = '/Users/aryamaanlakhotia/Desktop/founder-profiles'
const PEOPLE = [
  {
    "slug": "hans-w-becherer",
    "name": "Hans W. Becherer",
    "company": "Deere & Company",
    "years": "1989–2000",
    "sector": "Agriculture and Mining"
  },
  {
    "slug": "thomas-h-mcinnerney",
    "name": "Thomas H. McInnerney",
    "company": "National Dairy Products Corporation",
    "years": "1923–1941",
    "sector": "Agriculture and Mining"
  },
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
    "slug": "w-jeremiah-sanders-iii",
    "name": "W. Jeremiah Sanders III",
    "company": "Advanced Micro Devices",
    "years": "1969–2002",
    "sector": "Computers and Electronics"
  },
  {
    "slug": "elizabeth-e-boit",
    "name": "Elizabeth E. Boit",
    "company": "Winship, Boit, & Company",
    "years": "1888–1928",
    "sector": "Fabric and Apparel"
  },
  {
    "slug": "j-chadbourn-bolles",
    "name": "J. Chadbourn Bolles",
    "company": "Chadbourn",
    "years": "1936–1970",
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
    "slug": "charles-h-steinway",
    "name": "Charles H. Steinway",
    "company": "Steinway and Sons",
    "years": "1896–1919",
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
    "slug": "elbridge-a-stuart",
    "name": "Elbridge A. Stuart",
    "company": "Carnation Company",
    "years": "1901–1932",
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
    "slug": "f-kenneth-iverson",
    "name": "F. Kenneth Iverson",
    "company": "Nucor Corporation",
    "years": "1965–1996",
    "sector": "Metals"
  }
]
if (!PEOPLE.length) { log('No people passed.'); return { found: 0 } }

const UA = 'the-industrialists/1.0 (educational archive; ary.lakhotia@gmail.com)'

const RESULT = {
  type: 'object',
  additionalProperties: false,
  properties: {
    slug: { type: 'string' },
    found: { type: 'boolean', description: 'true only if a confirmed portrait of THIS person was downloaded' },
    sourcePage: { type: 'string', description: 'page the image came from' },
    imageUrl: { type: 'string', description: 'direct image URL used' },
    license: { type: 'string', description: 'e.g. Public domain, CC BY-SA, copyrighted/unknown' },
    free: { type: 'boolean', description: 'true if public-domain or an open CC license' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    note: { type: 'string' },
  },
  required: ['slug', 'found', 'confidence', 'free', 'note'],
}

function prompt(p) {
  const ext = '<jpg|png>'
  return `Find a real PHOTOGRAPHIC PORTRAIT of this specific person and download it:
${p.name}, ${p.company} (active ${p.years}; ${p.sector}).

This person currently has no portrait. Your job: locate one genuine portrait image OF THIS EXACT PERSON and save it to disk, or conclude none is findable.

SEARCH widely with WebSearch / WebFetch: Wikimedia Commons (try full name + middle names + alternate spellings), Find A Grave, the Library of Congress (loc.gov), archive.org, university/historical-society/museum collections, company histories, and newspaper/obituary photos (NYT, etc.). For pre-1929 figures a public-domain photo usually exists somewhere.

IDENTITY IS CRITICAL, do not paste the wrong face:
- The image must depict THIS individual (matching era, role at ${p.company}, and life dates). Cross-check captions and dates.
- REJECT: a different person who merely shares the name; a relative (father/son/spouse) with the same surname; company logos, buildings, products, group shots where the person isn't identifiable; book covers; statues unless clearly captioned as them.
- If you cannot CONFIRM identity, treat it as not found.

PREFER public-domain or openly-licensed (CC) images; note the license. You MAY use a clearly-attributed press/historical photo if that's all that exists, but mark free=false and license accordingly.

DOWNLOAD the chosen image with Bash, picking the extension from the URL:
  curl -sL -A '${UA}' -o '${ROOT}/public/portraits/${p.slug}.${ext}' '<IMAGE_URL>'
Then VERIFY it is a real image over ~3KB:
  file '${ROOT}/public/portraits/${p.slug}.'* ; ls -l '${ROOT}/public/portraits/${p.slug}.'*
If the download is HTML/an error/too small, delete it and try another source. Prefer a direct upload.wikimedia.org or loc.gov URL (those download cleanly). Save at a reasonable size (≈300–800px); avoid multi-MB originals when a thumbnail exists.

If after a genuine effort no confirmable portrait exists, do NOT save a file and return found:false.

Return the result object describing what you did (slug must be "${p.slug}").`
}

phase('Hunt')
const results = await parallel(
  PEOPLE.map((p) => () =>
    agent(prompt(p), { label: p.slug, phase: 'Hunt', agentType: 'general-purpose', schema: RESULT }),
  ),
)

const r = results.filter(Boolean)
const found = r.filter((x) => x.found)
log(`Downloaded ${found.length}/${PEOPLE.length}. Free: ${found.filter((x) => x.free).length}, non-free: ${found.filter((x) => !x.free).length}.`)
return {
  requested: PEOPLE.length,
  found: found.map((x) => ({ slug: x.slug, free: x.free, license: x.license, confidence: x.confidence, source: x.sourcePage })),
  notFound: r.filter((x) => !x.found).map((x) => x.slug),
}
