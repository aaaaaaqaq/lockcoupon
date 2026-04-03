import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'LockCoupon — Codes Promo & Réductions Vérifiées';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#C0392B',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            🔒
          </div>
          <div style={{ display: 'flex', fontSize: '48px', fontWeight: 800 }}>
            <span style={{ color: 'white' }}>lock</span>
            <span style={{ color: '#C0392B' }}>coupon</span>
          </div>
        </div>
        <div
          style={{
            color: 'white',
            fontSize: '36px',
            fontWeight: 700,
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.3,
          }}
        >
          Codes Promo & Réductions Vérifiées
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '22px',
            marginTop: '16px',
          }}
        >
          Économisez sur vos achats en ligne · 100% gratuit
        </div>
      </div>
    ),
    { ...size }
  );
}
