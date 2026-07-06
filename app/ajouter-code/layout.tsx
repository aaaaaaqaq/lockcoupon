import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ajouter un Code Promo',
  description: 'Partagez vos codes promo et bons plans avec la communauté LockCoupon. Soumettez un code vérifié par notre équipe.',
  alternates: {
    canonical: 'https://www.lockcoupon.com/ajouter-code',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function AjouterCodeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
