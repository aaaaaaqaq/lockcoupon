import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez l\'équipe LockCoupon pour vos questions, partenariats ou suggestions. Réponse sous 24h.',
  alternates: {
    canonical: 'https://www.lockcoupon.com/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
