/**
 * lib/indexnow.ts
 *
 * submitIndexNow(urls) — instant URL submission to Bing/Yandex/Seznam/Naver
 * via the IndexNow protocol. Bing's index powers ChatGPT search, so fast
 * Bing indexing = faster AI-search citations too.
 *
 * Key file is served at /<key>.txt (public/lockcoupon2026indexnow.txt).
 * Non-fatal by design: failures are logged, never thrown.
 */

const INDEXNOW_KEY = 'lockcoupon2026indexnow';
const HOST = 'www.lockcoupon.com';

export async function submitIndexNow(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0) return;

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
