'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    const mailtoLink = `mailto:contact@lockcoupon.com?subject=${encodeURIComponent(form.subject || 'Contact LockCoupon')}&body=${encodeURIComponent(`Nom: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.open(mailtoLink);
    setSent(true);
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="max-w-[600px] mx-auto px-4 pt-6">
          <ol className="flex items-center gap-1.5 text-[13px] text-muted">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-text-main">Contact</li>
          </ol>
        </nav>

        <div className="max-w-[600px] mx-auto px-4 py-10 md:py-16">
          <h1 className="text-text-main text-[32px] md:text-[40px] font-extrabold mb-3">Contactez-nous</h1>
          <p className="text-muted text-[15px] mb-8">
            Une question sur un code promo ? Un partenariat à proposer ? Une boutique à ajouter ?
            Écrivez-nous et nous vous répondrons dans les 24 heures. Vous pouvez également consulter
            notre <Link href="/a-propos" className="text-primary hover:underline">page à propos</Link> pour
            en savoir plus sur LockCoupon.
          </p>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <div className="text-[40px] mb-3">✅</div>
              <h2 className="text-text-main text-[20px] font-bold mb-2">Message envoyé !</h2>
              <p className="text-muted text-[14px]">Merci de nous avoir contacté. Nous vous répondrons dans les plus brefs délais.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="block text-text-main text-[13px] font-semibold mb-1.5">Nom complet *</label>
                <input id="contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Votre nom" className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-text-main text-[13px] font-semibold mb-1.5">Email *</label>
                <input id="contact-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="votre@email.com" className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label htmlFor="contact-subject" className="block text-text-main text-[13px] font-semibold mb-1.5">Sujet</label>
                <input id="contact-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Partenariat, question, suggestion..." className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-text-main text-[13px] font-semibold mb-1.5">Message *</label>
                <textarea id="contact-message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Écrivez votre message ici..." className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors resize-none" />
              </div>
              <button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-[15px] py-3.5 rounded-lg transition-colors">
                Envoyer le message
              </button>
            </div>
          )}

          {/* Additional SEO content (issue 7, 9) */}
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-text-main text-[20px] font-bold mb-3">Autres moyens de nous joindre</h2>
            <div className="text-muted text-[14px] leading-relaxed space-y-3">
              <p>
                Vous pouvez nous écrire directement à <strong className="text-text-main">contact@lockcoupon.com</strong>.
                Notre équipe répond généralement sous 24 heures ouvrées.
              </p>
              <p>
                Si vous souhaitez ajouter un code promo, utilisez notre{' '}
                <Link href="/ajouter-code" className="text-primary hover:underline">formulaire dédié</Link>.
                Pour les demandes de partenariat, précisez le nom de votre boutique et le type de collaboration envisagé.
              </p>
            </div>
            <nav aria-label="Liens utiles" className="mt-6 flex flex-wrap gap-3 text-[13px]">
              <Link href="/a-propos" className="text-primary hover:underline font-semibold">→ À propos</Link>
              <Link href="/boutiques" className="text-primary hover:underline font-semibold">→ Boutiques</Link>
              <Link href="/blog" className="text-primary hover:underline font-semibold">→ Blog</Link>
              <Link href="/conditions-utilisation" className="text-primary hover:underline font-semibold">→ CGU</Link>
            </nav>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
