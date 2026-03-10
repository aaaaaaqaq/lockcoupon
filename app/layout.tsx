import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LockCoupon — Codes Promo & Réductions Vérifiées',
  description:
    'Trouvez les meilleurs codes promo, coupons et réductions vérifiés pour vos boutiques préférées.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://lockcoupon.com'),
  openGraph: {
    title: 'LockCoupon — Codes Promo & Réductions Vérifiées',
    description:
      'Trouvez les meilleurs codes promo, coupons et réductions vérifiés.',
    url: '/',
    siteName: 'LockCoupon',
    locale: 'fr_FR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-bg">
        {children}
      </body>
    </html>
  );
}
