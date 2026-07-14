import { ImageResponse } from 'next/og';

/**
 * Per-post dynamic OG image — Google Discover eligibility fix.
 *
 * All 415 blog posts had cover_image: null and shared the generic site OG
 * image. Discover requires a large (≥1200px) relevant image per article +
 * max-image-preview:large (set in root layout). This file-based OG image
 * wins over config-based metadata, so every post gets a unique branded
 * 1200×630 card with its title — no DB backfill required. If a post later
 * gets a real cover_image, it is used as the card background.
 */

export const runtime = 'edge';
export const alt = 'Article LockCoupon';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface PostRow {
  title: string;
  cover_image: string | null;
  created_at: string;
}

async function fetchPost(slug: string): Promise<PostRow | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/blog_posts?select=title,cover_image,created_at&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as PostRow[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug);
  const title = post?.title ?? 'Blog LockCoupon — bons plans & codes promo vérifiés';
  const date = post
    ? new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  // Long titles get a smaller font so they always fit the card.
  const fontSize = title.length > 90 ? 44 : title.length > 60 ? 52 : 60;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: post?.cover_image
            ? '#1a1a1a'
            : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 60%, #3d2422 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {post?.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.35,
            }}
          />
        )}

        {/* Header: brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: '#C0392B',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            🔒
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: 'white', fontSize: '28px', fontWeight: 700 }}>LockCoupon</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '18px' }}>Blog — bons plans vérifiés</div>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            color: 'white',
            fontSize: `${fontSize}px`,
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: '1050px',
            display: 'flex',
          }}
        >
          {title.length > 130 ? `${title.slice(0, 128)}…` : title}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              background: '#C0392B',
              color: 'white',
              fontSize: '22px',
              fontWeight: 700,
              padding: '10px 28px',
              borderRadius: '999px',
              display: 'flex',
            }}
          >
            www.lockcoupon.com
          </div>
          {date && (
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '22px', display: 'flex' }}>{date}</div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
