'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    // For now, open mailto
    const mailtoLink = `mailto:contact@lockcoupon.com?subject=${encodeURIComponent(form.subject || 'Contact LockCoupon')}&body=${encodeURIComponent(`Nom: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.open(mailtoLink);
    setSent(true);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-[600px] mx-auto px-4 py-10 md:py-16">
        <h1 className="text-text-main text-[32px] md:text-[40px] font-extrabold mb-3">Contactez-nous</h1>
        <p className="text-muted text-[15px] mb-8">Une question ? Un partenariat ? Écrivez-nous et nous vous répondrons rapidement.</p>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="text-[40px] mb-3">✅</div>
            <h2 className="text-text-main text-[20px] font-bold mb-2">Message envoyé !</h2>
            <p className="text-muted text-[14px]">Merci de nous avoir contacté. Nous vous répondrons dans les plus brefs délais.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-text-main text-[13px] font-semibold mb-1.5">Nom complet *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Votre nom" className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-text-main text-[13px] font-semibold mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="votre@email.com" className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-text-main text-[13px] font-semibold mb-1.5">Sujet</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Partenariat, question, suggestion..." className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-text-main text-[13px] font-semibold mb-1.5">Message *</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Écrivez votre message ici..." className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors resize-none" />
            </div>
            <button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-[15px] py-3.5 rounded-lg transition-colors">
              Envoyer le message
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
