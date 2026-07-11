/**
 * lib/indexnow.ts
 *
 * submitIndexNow(urls) — instant URL submission to Bing/Yandex/Seznam/Naver
 * via the IndexNow protocol, PLUS the Bing Webmaster URL Submission API
 * (stronger priority signal, requires BING_WEBMASTER_API_KEY).
 * Bing's index powers ChatGPT search, Copilot, DuckDuckGo, Qwant & Ecosia,
 * so fast Bing indexing = faster AI-search citations too.
 *
 * Key file is served at /<key>.txt (public/lockcoupon2026indexnow.txt).
 * Non-fatal by design: failures are logged, never thrown.
 */

const INDEXNOW_KEY = 'lockcoupon2026indexnow';
const HOST = 'www.lockcoupon.com';
const SITE_URL = `https://${HOST}`;

export async function submitIndexNow(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0) return;
  const unique = Array.from(new Set(urls));

  await Promise.allSettled([
    submitIndexNowProtocol(unique),
    submitBingWebmaster(unique),
  ]);
}

async function submitIndexNowProtocol(urls: string[]): Promise<void> {
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: urls.slice(0, 10000),
      }),
    });
    console.log(`[IndexNow] ${res.status} — submitted ${urls.length} URL(s)`);
  } catch (e) {
    console.warn('[IndexNow] submission failed:', e);
  }
}

/**
 * Bing Webmaster URL Submission API. Daily quota starts low (~10/day for new
 * sites) and grows with site trust — quota errors are expected and harmless
 * (IndexNow above already covered the URLs).
 */
async function submitBingWebmaster(urls: string[]): Promise<void> {
  const apiKey = process.env.BING_WEBMASTER_API_KEY;
  if (!apiKey) return;

  try {
    const res = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          siteUrl: SITE_URL,
          urlList: urls.slice(0, 500),
        }),
      }
    );
    if (res.ok) {
      console.log(`[BingWebmaster] 200 — submitted ${Math.min(urls.length, 500)} URL(s)`);
    } else {
      const body = await res.text().catch(() => '');
      console.warn(`[BingWebmaster] ${res.status} — ${body.slice(0, 200)}`);
    }
  } catch (e) {
    console.warn('[BingWebmaster] submission failed:', e);
  }
}
