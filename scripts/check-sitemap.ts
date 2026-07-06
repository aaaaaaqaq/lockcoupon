/**
 * Sitemap hygiene checker — fetches every URL in the sitemap and reports
 * any that do not return HTTP 200 (redirects, 404s, 5xx).
 *
 * Usage:
 *   node scripts/check-sitemap.ts                       # checks live sitemap
 *   node scripts/check-sitemap.ts http://localhost:3000/sitemap.xml
 *
 * Requires Node >= 22.6 (TypeScript type stripping) — Node 24 runs it natively.
 * Exit code 0 = all URLs return 200. Exit code 1 = at least one problem.
 */

const SITEMAP_URL = process.argv[2] || 'https://www.lockcoupon.com/sitemap.xml';
const CONCURRENCY = 10;
const CANONICAL_ORIGIN = 'https://www.lockcoupon.com';

interface CheckResult {
  url: string;
  status: number;
  redirectTo?: string;
  error?: string;
}

async function fetchSitemapUrls(sitemapUrl: string): Promise<string[]> {
  const res = await fetch(sitemapUrl, { redirect: 'manual' });
  if (res.status !== 200) {
    throw new Error(`Sitemap itself returned HTTP ${res.status} — aborting.`);
  }
  const xml = await res.text();
  const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
  if (urls.length === 0) throw new Error('No <loc> entries found in sitemap.');
  return urls;
}

/** Static (non-network) canonical-form lint on every sitemap URL. */
function lintCanonicalForm(urls: string[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const url of urls) {
    if (!url.startsWith(`${CANONICAL_ORIGIN}/`) && url !== CANONICAL_ORIGIN) {
      problems.push(`NON-CANONICAL HOST/SCHEME: ${url}`);
    }
    if (url !== CANONICAL_ORIGIN && url.endsWith('/')) {
      problems.push(`TRAILING SLASH: ${url}`);
    }
    if (url.includes('?') || url.includes('#')) {
      problems.push(`QUERY/FRAGMENT IN URL: ${url}`);
    }
    if (seen.has(url)) problems.push(`DUPLICATE ENTRY: ${url}`);
    seen.add(url);
  }
  return problems;
}

async function checkUrl(url: string): Promise<CheckResult> {
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'user-agent': 'LockCoupon-SitemapChecker/1.0' },
    });
    const result: CheckResult = { url, status: res.status };
    if (res.status >= 300 && res.status < 400) {
      result.redirectTo = res.headers.get('location') || '(no location header)';
    }
    return result;
  } catch (err) {
    return { url, status: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

async function run() {
  console.log(`Fetching sitemap: ${SITEMAP_URL}`);
  const urls = await fetchSitemapUrls(SITEMAP_URL);
  console.log(`Found ${urls.length} URLs. Linting canonical form...`);

  const lintProblems = lintCanonicalForm(urls);
  for (const p of lintProblems) console.log(`  ✗ ${p}`);

  console.log(`Checking HTTP status (concurrency ${CONCURRENCY})...`);
  const results: CheckResult[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      results.push(await checkUrl(url));
      if (results.length % 50 === 0) {
        process.stdout.write(`  …${results.length}/${urls.length}\n`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const bad = results.filter((r) => r.status !== 200);
  console.log('\n───── REPORT ─────');
  console.log(`Total URLs:   ${urls.length}`);
  console.log(`HTTP 200:     ${results.length - bad.length}`);
  console.log(`Problems:     ${bad.length + lintProblems.length}`);

  if (bad.length > 0) {
    console.log('\nNon-200 URLs:');
    for (const r of bad.sort((a, b) => a.status - b.status)) {
      const detail = r.redirectTo ? ` → ${r.redirectTo}` : r.error ? ` (${r.error})` : '';
      console.log(`  [${r.status || 'ERR'}] ${r.url}${detail}`);
    }
  }

  if (bad.length === 0 && lintProblems.length === 0) {
    console.log('\n✅ Sitemap is clean: every URL is canonical-form and returns HTTP 200.');
    process.exit(0);
  }
  process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
