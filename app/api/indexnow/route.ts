import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = 'lockcoupon2026indexnow';
const HOST = 'https://www.lockcoupon.com';

export async function POST(request: NextRequest) {
  // CRON_SECRET was never set in Vercel env → this endpoint always 401'd.
  // Fall back to ADMIN_PASSWORD (always set) so manual bulk submissions work.
  const secret = request.nextUrl.searchParams.get('secret');
  const expected = process.env.CRON_SECRET || process.env.ADMIN_PASSWORD;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const urls: string[] = body?.urls || [];

    if (urls.length === 0) {
      return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
    }

    // Submit to IndexNow (Bing/Yandex instant indexing)
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'www.lockcoupon.com',
        key: INDEXNOW_KEY,
        keyLocation: `${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: urls.slice(0, 10000),
      }),
    });

    return NextResponse.json({
      ok: true,
      status: response.status,
      submitted: urls.length,
    });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
