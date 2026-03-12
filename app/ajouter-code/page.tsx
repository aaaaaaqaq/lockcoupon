'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

export default function AjouterCodePage() {
  const [form, setForm] = useState({ store_name: '', code: '', discount: '', description: '', email: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!form.store_name || !form.description) return;
    await supabase.from('messages').insert({
      name: form.store_name,
      email: form.email || 'non fourni',
      subject: `Code soumis: ${form.store_name} - ${form.code || 'pas de code'}`,
      message: `Boutique: ${form.store_name}\nCode: ${form.code || 'Aucun'}\nRéduction: ${form.discount || 'Non précisé'}\nDescription: ${form.description}\nEmail: ${form.email || 'Non fourni'}`,
    });
    setSent(true);
  };

  return (
    <>
      <Navbar />

      <section className="bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-[1200px] mx-auto px-4 py-8 md:py-12 text-center">
          <div className="text-[40px] mb-3">🎁</div>
          <h1 className="text-white text-[28px] sm:text-[36px] font-extrabold leading-tight mb-3">
            Ajouter un <span className="text-primary">code promo</span>
          </h1>
          <p className="text-white/50 text-[14px] md:text-[16px] max-w-lg mx-auto">
            Partagez vos bons plans avec la communauté LockCoupon !
          </p>
        </div>
      </section>

      <div className="max-w-[550px] mx-auto px-4 py-8 md:py-12">
        {sent ? (
          <div className="bg-white border border-border rounded-2xl p-8 text-center">
            <div className="text-[48px] mb-4">✅</div>
            <h2 className="text-text-main text-[22px] font-bold mb-2">Merci !</h2>
            <p className="text-muted text-[15px] mb-6">Notre équipe va vérifier votre code et le publier s&apos;il est valide.</p>
            <button onClick={() => { setSent(false); setForm({ store_name: '', code: '', discount: '', description: '', email: '' }); }} className="bg-primary hover:bg-primary-dark text-white font-bold text-[14px] px-6 py-2.5 rounded-lg transition-colors">
              Ajouter un autre code
            </button>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-2xl p-6 md:p-8 space-y-4">
            <div>
              <label className="block text-text-main text-[13px] font-semibold mb-1.5">Nom de la boutique *</label>
              <input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="ex: Nike, Shein, Amazon..." className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-text-main text-[13px] font-semibold mb-1.5">Code promo</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ex: SAVE20, PROMO15..." className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors font-mono" />
            </div>
            <div>
              <label className="block text-text-main text-[13px] font-semibold mb-1.5">Réduction</label>
              <input value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="ex: 20%, 10€ offerts, livraison gratuite..." className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-text-main text-[13px] font-semibold mb-1.5">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Décrivez l'offre en quelques mots..." className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-text-main text-[13px] font-semibold mb-1.5">Votre email (optionnel)</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Pour vous notifier quand le code est publié" className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors" />
            </div>
            <button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-[15px] py-3.5 rounded-lg transition-colors mt-2">
              Soumettre le code
            </button>
            <p className="text-muted text-[11px] text-center">Les codes soumis sont vérifiés avant publication.</p>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
