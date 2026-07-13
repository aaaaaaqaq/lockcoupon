import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site';

// The contact page is a client component ('use client') and cannot export
// metadata itself — without this layout it shipped with NO title/canonical
// while being listed in the sitemap (Task 3 canonical audit, July 2026).
export const metadata: Metadata = {
  title: 'Contact — LockCoupon',
  description:
    'Une question, un code promo à signaler ou un partenariat ? Contactez l\u2019équipe LockCoupon, nous répondons sous 48h ouvrées.',
  alternates: {
    canonical: absoluteUrl('/contact'),
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
