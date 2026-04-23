import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'LockCoupon — Codes Promo Vérifiés 2026',
    template: '%s | LockCoupon',
  },
  description:
    'Trouvez les meilleurs codes promo et réductions vérifiés pour vos boutiques préférées. Mis à jour chaque jour, 100% gratuit.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lockcoupon.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'LockCoupon — Codes Promo Vérifiés 2026',
    description:
      'Codes promo, coupons et réductions vérifiés chaque jour.',
    url: '/',
    siteName: 'LockCoupon',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'LockCoupon — Codes Promo Vérifiés',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LockCoupon — Codes Promo Vérifiés 2026',
    description: 'Codes promo, coupons et réductions vérifiés chaque jour.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LockCoupon',
    url: 'https://www.lockcoupon.com',
    logo: 'https://www.lockcoupon.com/og-default.png',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@lockcoupon.com',
      availableLanguage: 'French',
    },
  };

  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-screen bg-bg">
        {children}
      </body>
    </html>
  );
}
