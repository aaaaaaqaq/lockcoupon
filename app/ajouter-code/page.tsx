'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import type { Store } from '@/lib/supabase';

export default function AjouterCodePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [storeQuery, setStoreQuery] = useState('');
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    code: '', discount_value: '', discount_type: 'percent', type: 'code',
    description: '', affiliate_url: '', email: '',
  });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.from('stores').select('*').order('name').then(({ data }) => {
      if (data) setStores(data);
    });
  }, []);

  useEffect(() => {
    if (storeQuery.length > 0) {
      const filtered = stores.filter(s => s.name.toLowerCase().includes(storeQuery.toLowerCase())).slice(0, 8);
      setFilteredStores(filtered);
      setShowDropdown(true);
    } else {
      setFilteredStores([]);
      setShowDropdown(false);
    }
  }, [storeQuery, stores]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectStore = (store: Store) => {
    setSelectedStore(store);
    setStoreQuery(store.name);
    setShowDropdown(false);
  };

  const handleSubmit = async () => {
    if (!selectedStore || !form.description) return;

    await supabase.from('coupons').insert({
      store_id: selectedStore.id,
      title: form.description,
      code: form.code || null,
      discount_value: form.discount_value || null,
      discount_type: form.discount_type,
      type: form.type,
      affiliate_url: form.affiliate_url || null,
      expiry_date: null,
      is_best: false,
      is_exclusive: false,
      is_verified: false,
      usage_count: 0,
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

      <div className="max-w-[600px] mx-auto px-4 py-8 md:py-12">
        {sent ? (
          <div className="bg-white border border-border rounded-2xl p-8 text-center">
            <div className="text-[48px] mb-4">✅</div>
            <h2 className="text-text-main text-[22px] font-bold mb-2">Merci !</h2>
            <p className="text-muted text-[15px] mb-6">Votre code a été ajouté et sera vérifié par notre équipe.</p>
            <button onClick={() => { setSent(false); setForm({ code: '', discount_value: '', discount_type: 'percent', type: 'code', description: '', affiliate_url: '', email: '' }); setSelectedStore(null); setStoreQuery(''); }} className="bg-primary hover:bg-primary-dark text-white font-bold text-[14px] px-6 py-2.5 rounded-lg transition-colors">
              Ajouter un autre code
            </button>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-2xl p-6 md:p-8">
            <h2 className="text-text-main text-[18px] font-bold mb-5">🏷️ Informations du code promo</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Store search */}
              <div className="md:col-span-2" ref={dropdownRef}>
                <label className="block text-[13px] font-semibold text-text-main mb-1">Boutique *</label>
                <div className="relative">
                  <input
                    value={storeQuery}
                    onChange={(e) => { setStoreQuery(e.target.value); setSelectedStore(null); }}
                    onFocus={() => { if (filteredStores.length > 0) setShowDropdown(true); }}
                    placeholder="Tapez pour rechercher une boutique..."
                    className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary transition-colors"
                  />
                  {selectedStore && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success text-[14px]">✓</span>
                  )}
                  {showDropdown && filteredStores.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-xl z-10 max-h-[240px] overflow-y-auto">
                      {filteredStores.map((store) => (
                        <button
                          key={store.id}
                          onClick={() => selectStore(store)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          {store.logo_url ? (
                            <img src={store.logo_url} alt={store.name} className="w-8 h-8 rounded-lg object-contain" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[14px] font-bold" style={{ backgroundColor: store.logo_color || '#C0392B' }}>
                              {store.logo_letter || store.name[0]}
                            </div>
                          )}
                          <div>
                            <p className="text-text-main text-[14px] font-semibold">{store.name}</p>
                            <p className="text-muted text-[11px]">{store.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Code */}
              <div>
                <label className="block text-[13px] font-semibold text-text-main mb-1">Code promo</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ex: SAVE20" className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary font-mono" />
              </div>

              {/* Discount value */}
              <div>
                <label className="block text-[13px] font-semibold text-text-main mb-1">Valeur de la réduction</label>
                <input value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder="ex: 20" className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary" />
              </div>

              {/* Discount type */}
              <div>
                <label className="block text-[13px] font-semibold text-text-main mb-1">Type de réduction</label>
                <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary">
                  <option value="percent">Pourcentage (%)</option>
                  <option value="euro">Euro (€)</option>
                  <option value="free">Gratuit / Livraison</option>
                  <option value="cashback">Cashback</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[13px] font-semibold text-text-main mb-1">Catégorie</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary">
                  <option value="code">Code Promo</option>
                  <option value="cashback">Cashback</option>
                  <option value="bon">Bon Plan</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-[13px] font-semibold text-text-main mb-1">Description de l&apos;offre *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="ex: 20% de réduction sur tout le site pour les nouveaux clients" className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary resize-none" />
              </div>

              {/* Affiliate URL */}
              <div className="md:col-span-2">
                <label className="block text-[13px] font-semibold text-text-main mb-1">🔗 Lien de l&apos;offre</label>
                <input value={form.affiliate_url} onChange={(e) => setForm({ ...form, affiliate_url: e.target.value })} placeholder="https://www.boutique.com/offre" className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary" />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-[13px] font-semibold text-text-main mb-1">Votre email (optionnel)</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Pour être notifié quand le code est publié" className="w-full border border-border rounded-lg px-4 py-3 text-[15px] outline-none focus:border-primary" />
              </div>
            </div>

            <button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-[15px] py-3.5 rounded-lg transition-colors mt-6">
              Soumettre le code promo
            </button>
            <p className="text-muted text-[11px] text-center mt-3">Les codes soumis sont vérifiés avant publication.</p>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
