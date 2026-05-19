/**
 * lib/google-indexing.ts
 *
 * Two utilities:
 *  1. pingSitemap()      — GET ping to Google so it re-fetches sitemap.xml
 *  2. notifyGoogle(urls) — Google Indexing API: instant URL submission
 *
 * Auth: Service Account JWT (no extra npm packages — uses Node built-in crypto).
 * Env vars needed (set in Vercel):
 *   GOOGLE_SA_CLIENT_EMAIL   — service account email
 *   GOOGLE_SA_PRIVATE_KEY    — private key (replace \n with real newlines in Vercel)
 */

const SITEMAP_URL = 'https://www.lockcoupon.com/sitemap.xml';
const INDEXING_API = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const SCOPE = 'https://www.googleapis.com/auth/indexing';

// ─── 1. Sitemap Ping ──────────────────────────────────────────────────────────
// Classic Google ping — tells Googlebot to re-fetch the sitemap immediately.
// Free, no auth required, works for any site.
export async function pingSitemap(): Promise<void> {
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
  try {
    const res = await fetch(pingUrl, { method: 'GET' });
    console.log(`[GSC] Sitemap ping → ${res.status}`);
  } catch (e) {
    // Non-fatal — log and continue
    console.warn('[GSC] Sitemap ping failed:', e);
  }
}

// ─── 2. JWT Builder (RS256, no dependencies) ─────────────────────────────────
async function buildJWT(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientEmail,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const signingInput = `${encode(header)}.${encode(payload)}`;

  // Import the RSA private key using Web Crypto API (available in Next.js Edge + Node)
  const pemBody = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');

  const keyBuffer = Buffer.from(pemBody, 'base64');

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    Buffer.from(signingInput),
  );

  const signature = Buffer.from(signatureBuffer).toString('base64url');
  return `${signingInput}.${signature}`;
}

// ─── 3. Get OAuth Access Token ────────────────────────────────────────────────
async function getAccessToken(): Promise<string | null> {
  const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    console.warn('[GSC] Missing GOOGLE_SA_CLIENT_EMAIL or GOOGLE_SA_PRIVATE_KEY env vars');
    return null;
  }

  try {
    const jwt = await buildJWT(clientEmail, privateKey);

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    const data = await res.json();
    if (!data.access_token) {
      console.warn('[GSC] Token error:', data);
      return null;
    }

    return data.access_token;
  } catch (e) {
    console.warn('[GSC] Auth error:', e);
    return null;
  }
}

// ─── 4. Notify Google (Indexing API) ─────────────────────────────────────────
// type: 'URL_UPDATED' for new/updated pages, 'URL_DELETED' for removed pages
export async function notifyGoogle(
  urls: string[],
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED',
): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    console.warn('[GSC] Skipping Indexing API — no valid token');
    return;
  }

  // Google Indexing API: one request per URL (max ~200/day on free quota)
  // We send them sequentially to avoid burst issues
  for (const url of urls) {
    try {
      const res = await fetch(INDEXING_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url, type }),
      });
      const body = await res.json();
      if (res.ok) {
        console.log(`[GSC] ✅ Indexed: ${url}`);
      } else {
        console.warn(`[GSC] ❌ Failed ${url}:`, body);
      }
    } catch (e) {
      console.warn(`[GSC] Error for ${url}:`, e);
    }
  }
}
