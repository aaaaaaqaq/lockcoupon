import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BonPlan.ma — Codes Promo & Réductions Vérifiées',
  description:
    'Trouvez les meilleurs codes promo, coupons et réductions vérifiés pour vos boutiques préférées au Maroc et à l\'international.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bonplan.ma'),
  openGraph: {
    title: 'BonPlan.ma — Codes Promo & Réductions Vérifiées',
    description:
      'Trouvez les meilleurs codes promo, coupons et réductions vérifiés.',
    url: '/',
    siteName: 'BonPlan.ma',
    locale: 'fr_MA',
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
