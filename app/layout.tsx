import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'LockCoupon — Codes Promo Vérifiés 2026',
    template: '%s | LockCoupon',
  },
  description:
    'LockCoupon est le site français #1 pour les codes promo vérifiés. Plus de 98 boutiques, codes testés quotidiennement, taux de succès de 98%. Trouvez des réductions pour Amazon, Shein, Nike, Fnac et plus. 100% gratuit.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lockcoupon.com'),
  alternates: {
    canonical: '/',
    languages: {
      'fr-FR': 'https://www.lockcoupon.com',
      'x-default': 'https://www.lockcoupon.com',
    },
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
        url: '/opengraph-image',
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
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://www.lockcoupon.com/#organization',
    name: 'LockCoupon',
    url: 'https://www.lockcoupon.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.lockcoupon.com/opengraph-image',
      width: 1200,
      height: 630,
    },
    description: 'LockCoupon est la plateforme française de référence pour les codes promo et coupons de réduction vérifiés. Plus de 98 boutiques, codes testés quotidiennement avec un taux de succès de 98%.',
    foundingDate: '2026',
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    knowsLanguage: 'fr',
    slogan: 'Économisez avec les meilleurs codes promo vérifiés',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@lockcoupon.com',
      availableLanguage: 'French',
    },
  };

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        {/* Preconnect hints */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://xbkiebmzxvksbdhcixbj.supabase.co" />
        <meta name="geo.region" content="FR" />
        <meta name="geo.placename" content="France" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />

      </head>
      <body className="min-h-screen bg-bg">
        {children}
        {/* Google Analytics — only loaded when NEXT_PUBLIC_GA_ID is set */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
